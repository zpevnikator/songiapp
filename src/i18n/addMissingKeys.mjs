import fs from "fs";

const [inFile, outFile] = process.argv.slice(-2);

const input = JSON.parse(fs.readFileSync(inFile, { encoding: "utf-8" }));
const output = JSON.parse(fs.readFileSync(outFile, { encoding: "utf-8" }));

for (const key in input) {
    if (!output[key]) {
        output[key] = `*** ${input[key]}`;
    }
}

fs.writeFileSync(
    outFile,
    JSON.stringify(output, Object.keys(output).sort(), 2)
);
