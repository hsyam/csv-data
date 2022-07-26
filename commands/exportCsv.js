const fs = require("fs");
const { parse  } = require("csv-parse");
const { stringify } = require("csv-stringify");
var path = require("path");

exportCsv = async (filePath) => {
    let rows = await parseFile(filePath)
    let mapedRows = mapToHeaders(rows);
    let groupByName = groupBy(mapedRows,'name')
    let avgOrders = calcAverage(groupByName,rows.length)
    let brandsOrdersCount = getBrandsOrdersCount(groupBy(mapedRows,'brand'))
    let popularBrands = getPopularBrands(brandsOrdersCount)

    exportCSVFiles(path.basename(filePath),avgOrders,popularBrands)
    console.log('Export Completed Successfully')

}

/**
 * 
 * @param {String} filePath 
 * @returns {[]}
 */
parseFile = async (filePath) =>{
    let records = [];
    parser  = fs.createReadStream(filePath)
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    for await (const record of parser) {
        records.push(record)
      }
      return records
}
/**
 * 
 * @param {[]} row 
 * @returns {[]}
 */
mapToHeaders = (rows) => {
    const headers = ["id", "area", "name", "quantity", "brand"];
    const arr = rows.map((row)=>{
        const element = headers.reduce(function (object, header, index) {
            object[header] = row[index];
            return object;
          }, {});
          return element;
    })
    return arr
}

/**
 * 
 * @param {[]} items 
 * @param {[]} key 
 */
groupBy = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), 
    {},
);

/**
 * 
 * @param {[]} grouped 
 * @param {Int} total 
 * @returns 
 */
calcAverage = (grouped, total) => {
    let result = [];
    Object.keys(grouped).map(function (key) {
        let totalQty = 0;
        grouped[key].forEach(e=>{
            totalQty = (+totalQty) + (+e.quantity)
        })
        result.push([key, totalQty / total])
    });
    return result;
  }

/**
 * 
 * @param {[]} orders 
 */
getBrandsOrdersCount = (orders) => {
    let arr = []
    Object.keys(orders).map(function (key) {
        arr.push({
            name:orders[key][0].name,
            brand:key,
            count:orders[key].length
        })
    });
    return arr;
  }

/**
 * 
 * @param {[]} itemsWithCount 
 */
getPopularBrands = (itemsWithCount)=>{
    let result = itemsWithCount.filter((e, i) => {
        return itemsWithCount.findIndex((x) => {
        return x.name == e.name && x.count >= e.count;}) == i;
    });
    result = result.map(i=>{
        return [i.name,i.brand]
    })
    return result
}
/**
 * @param {string} fileName 
 * @param {[]} data 
 */
writeCSVFile = (fileName,data)=>{
    const writableStream = fs.createWriteStream(fileName);
    const stringifier = stringify({ header: false});
    data.forEach(row=>{
        stringifier.write(row);
    })
    stringifier.pipe(writableStream);
}

/**
 * @param {string} fileName 
 * @param {[]} data 
 */
 exportCSVFiles = (fileName,avgOrders,popularBrands)=>{
     writeCSVFile('0_'+fileName,avgOrders)
     writeCSVFile('1_'+fileName,popularBrands)
}


module.exports = exportCsv