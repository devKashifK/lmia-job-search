const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../Canada_NOC_Codes_with_TEER.xlsx');
console.log(`Reading file from: ${filePath}`);

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet Name: ${sheetName}`);

    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Header: 1 gives array of arrays

    if (data.length > 0) {
        // Headers are at index 0
        const headers = data[0];
        const categoryIndex = headers.indexOf('Category');

        if (categoryIndex !== -1) {
            const categories = data.slice(1).map(row => row[categoryIndex]).filter(c => c); // Filter out empty/undefined
            const uniqueCategories = [...new Set(categories)];

            console.log(`Found ${uniqueCategories.length} unique categories:`);
            uniqueCategories.forEach(c => console.log(`- ${c}`));
        } else {
            console.log("Category column not found.");
        }
    } else {
        console.log('No data found in the sheet.');
    }

} catch (error) {
    console.error('Error reading file:', error);
}
