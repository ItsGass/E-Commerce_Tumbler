<?php

declare(strict_types=1);

/**
 * Optimizes the demo product photos for seeding.
 *
 * Reads originals from database/seeders/demo-assets-src and writes JPEGs to
 * database/seeders/demo-assets. Originals are never modified. Every output is
 * at most 1200px wide (never upscaled), stripped of metadata, and compressed
 * between quality 78 and 60 until it is under 200 KB.
 *
 * Usage: php scripts/optimize-demo-assets.php
 */

const MAX_WIDTH = 1200;
const MAX_BYTES = 200 * 1024;
const START_QUALITY = 78;
const MIN_QUALITY = 60;
const QUALITY_STEP = 2;
const NEUTRAL_RGB = [242, 242, 242];

if (! extension_loaded('gd')) {
    fwrite(STDERR, "Error: the GD extension is required.\n");
    exit(1);
}

$root = dirname(__DIR__);
$sourceDir = $root.'/database/seeders/demo-assets-src';
$targetDir = $root.'/database/seeders/demo-assets';

if (! is_dir($sourceDir)) {
    fwrite(STDERR, "Error: source directory not found: database/seeders/demo-assets-src\n");
    exit(1);
}

if (! is_dir($targetDir) && ! mkdir($targetDir, 0775, true) && ! is_dir($targetDir)) {
    fwrite(STDERR, "Error: cannot create target directory: database/seeders/demo-assets\n");
    exit(1);
}

$files = glob($sourceDir.'/*') ?: [];
sort($files);

if ($files === []) {
    fwrite(STDERR, "Error: no files found in database/seeders/demo-assets-src\n");
    exit(1);
}

$totalBefore = 0;
$totalAfter = 0;
$overLimit = [];
$outputs = [];

foreach ($files as $file) {
    $name = basename($file);
    $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

    if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp'], true)) {
        fwrite(STDERR, "Error: unsupported file type: {$name}\n");
        exit(1);
    }

    if (! preg_match('/^(.+)-([123])$/', pathinfo($name, PATHINFO_FILENAME), $matches)) {
        fwrite(STDERR, "Error: expected {slug}-{1,2,3}: {$name}\n");
        exit(1);
    }

    $slug = $matches[1];
    $index = (int) $matches[2];

    $info = @getimagesize($file);

    if ($info === false) {
        fwrite(STDERR, "Error: cannot read image: {$name}\n");
        exit(1);
    }

    $originalWidth = $info[0];
    $originalHeight = $info[1];
    $originalBytes = (int) filesize($file);

    $image = loadImage($file, $extension);

    if ($image === null) {
        fwrite(STDERR, "Error: GD could not decode: {$name}\n");
        exit(1);
    }

    $image = applyExifOrientation($image, $file, $extension);
    $image = flattenOnNeutral($image);
    $image = resizeToMaxWidth($image);

    $optimizedWidth = imagesx($image);
    $optimizedHeight = imagesy($image);
    $quality = START_QUALITY;
    $encoded = '';

    while (true) {
        $encoded = encodeJpeg($image, $quality);

        if (strlen($encoded) <= MAX_BYTES || $quality <= MIN_QUALITY) {
            break;
        }

        $quality -= QUALITY_STEP;
    }

    $target = $targetDir.'/'.$slug.'-'.$index.'.jpg';

    if (file_put_contents($target, $encoded) === false) {
        fwrite(STDERR, "Error: cannot write: database/seeders/demo-assets/{$slug}-{$index}.jpg\n");
        exit(1);
    }

    $optimizedBytes = strlen($encoded);
    $totalBefore += $originalBytes;
    $totalAfter += $optimizedBytes;
    $outputs[] = $target;

    if ($optimizedBytes > MAX_BYTES) {
        $overLimit[] = $slug.'-'.$index.'.jpg';
    }

    printf(
        "%-40s | %8s -> %7s | %4dx%-4d -> %4dx%-4d | q=%d%s\n",
        $slug.'-'.$index.'.jpg',
        formatBytes($originalBytes),
        formatBytes($optimizedBytes),
        $originalWidth,
        $originalHeight,
        $optimizedWidth,
        $optimizedHeight,
        $quality,
        $optimizedBytes > MAX_BYTES ? ' OVER 200KB' : '',
    );
}

echo "\n";
printf("Total: %s -> %s (%d files)\n", formatBytes($totalBefore), formatBytes($totalAfter), count($outputs));

if ($overLimit !== []) {
    echo 'Still over 200 KB: '.implode(', ', $overLimit)."\n";
} else {
    echo "All files are under 200 KB.\n";
}

function loadImage(string $file, string $extension): ?GdImage
{
    return match ($extension) {
        'jpg', 'jpeg' => imagecreatefromjpeg($file) ?: null,
        'png' => imagecreatefrompng($file) ?: null,
        'webp' => function_exists('imagecreatefromwebp') ? (imagecreatefromwebp($file) ?: null) : null,
        default => null,
    };
}

function applyExifOrientation(GdImage $image, string $file, string $extension): GdImage
{
    if (! in_array($extension, ['jpg', 'jpeg'], true) || ! function_exists('exif_read_data')) {
        return $image;
    }

    $exif = @exif_read_data($file);
    $orientation = is_array($exif) && isset($exif['Orientation']) ? (int) $exif['Orientation'] : 1;

    if ($orientation === 1) {
        return $image;
    }

    $rotated = match ($orientation) {
        2 => flip($image, IMG_FLIP_HORIZONTAL),
        3 => imagerotate($image, 180, 0),
        4 => flip($image, IMG_FLIP_VERTICAL),
        5 => rotateAndFlip($image, -90, IMG_FLIP_HORIZONTAL),
        6 => imagerotate($image, -90, 0),
        7 => rotateAndFlip($image, -90, IMG_FLIP_VERTICAL),
        8 => imagerotate($image, 90, 0),
        default => $image,
    };

    return $rotated instanceof GdImage ? $rotated : $image;
}

function rotateAndFlip(GdImage $image, int $angle, int $flipMode): ?GdImage
{
    $rotated = imagerotate($image, $angle, 0);

    if (! $rotated instanceof GdImage) {
        return null;
    }

    imageflip($rotated, $flipMode);

    return $rotated;
}

function flip(GdImage $image, int $mode): GdImage
{
    imageflip($image, $mode);

    return $image;
}

function flattenOnNeutral(GdImage $image): GdImage
{
    $width = imagesx($image);
    $height = imagesy($image);
    $canvas = imagecreatetruecolor($width, $height);

    if ($canvas === false) {
        return $image;
    }

    $background = imagecolorallocate($canvas, ...NEUTRAL_RGB);
    imagefilledrectangle($canvas, 0, 0, $width, $height, $background);
    imagealphablending($canvas, true);
    imagecopy($canvas, $image, 0, 0, 0, 0, $width, $height);

    return $canvas;
}

function resizeToMaxWidth(GdImage $image): GdImage
{
    $width = imagesx($image);
    $height = imagesy($image);

    if ($width <= MAX_WIDTH) {
        return $image;
    }

    $targetWidth = MAX_WIDTH;
    $targetHeight = (int) round($height * ($targetWidth / $width));
    $resized = imagecreatetruecolor($targetWidth, $targetHeight);

    if ($resized === false) {
        return $image;
    }

    imagecopyresampled($resized, $image, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

    return $resized;
}

function encodeJpeg(GdImage $image, int $quality): string
{
    ob_start();
    imagejpeg($image, null, $quality);

    return (string) ob_get_clean();
}

function formatBytes(int $bytes): string
{
    return number_format($bytes / 1024, 0).' KB';
}
