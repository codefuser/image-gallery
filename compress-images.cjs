const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'public', 'img');
const tmpDir = path.join(__dirname, 'public', 'img_compressed');

// Create temp output dir
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const files = fs.readdirSync(inputDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

console.log(`Compressing ${files.length} images...\n`);

(async () => {
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(tmpDir, file);

    const stat = fs.statSync(inputPath);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(2);

    await sharp(inputPath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true })
      .toFile(outputPath);

    const newStat = fs.statSync(outputPath);
    const newSizeMB = (newStat.size / 1024 / 1024).toFixed(2);
    console.log(`✅ ${file}: ${sizeMB}MB → ${newSizeMB}MB`);
  }

  // Now overwrite originals from tmp
  console.log('\nReplacing originals...');
  for (const file of files) {
    const src = path.join(tmpDir, file);
    const dest = path.join(inputDir, file);
    fs.writeFileSync(dest, fs.readFileSync(src));
    fs.unlinkSync(src);
  }
  fs.rmdirSync(tmpDir);

  console.log('\n✅ Done! All images compressed.');
})();
