import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

const browser = await puppeteer.launch();
const page = await browser.newPage();

console.log('Chargement de salaires.dev...');
await page.goto('https://salaires.dev', { waitUntil: 'networkidle2' });

console.log('Extraction des intitulés de poste...');
const postes = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('table tbody tr'));
  return rows.map(row => {
    const cells = row.querySelectorAll('td');
    return cells[1]?.innerText.trim(); // colonne: intitulé du poste
  });
});

// Nettoyage
const unique = [...new Set(postes.filter(Boolean))];
unique.sort();

// Enregistrement dans un fichier JSON
const filePath = './postes_salairedev.json';
await writeFile(filePath, JSON.stringify(unique, null, 2), 'utf-8');

console.log(`✅ ${unique.length} intitulés enregistrés dans ${filePath}`);
await browser.close();
