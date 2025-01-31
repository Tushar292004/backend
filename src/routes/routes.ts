import express, { Request, Response } from "express";
import User from "../models/User"; // Import the User model

const router = express.Router();

interface ExcelSheet {
  [sheetName: string]: Array<Record<string, any>>; // Each sheet is an array of rows
}
interface ExcelData {
  filename: string;
  sheets: ExcelSheet;
}

router.post("/upload", async (req: Request, res: any) => {
  try {
    console.log("Received Request Body:", req.body);
    const { filename, sheets }: ExcelData = req.body; // Assuming JSON is sent in request body

    if (!filename || !sheets || Object.keys(sheets).length === 0) {
      return res.status(400).json({ error: "Invalid file data received" });
    }

    console.log("Processing Excel File:", filename);

    let usersToSave: any[] = [];

     // 🔥 Iterate over all sheets
     Object.entries(sheets).forEach(([sheetName, data]) => {
      console.log(`Processing Sheet: ${sheetName}`);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`Skipping empty sheet: ${sheetName}`);
        return;
      }

      const sheetUsers = data.map((row) => {
        const { Name, Amount, Date: dateValue } = row;

        // Validation checks
        const isValidName = typeof Name === "string" && Name.trim() !== "";
        const numericAmount = parseFloat(Amount); 
        const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;
        const parseCustomDate = (dateStr: string) => {
          const parts = dateStr.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return new Date(`${year}-${month}-${day}`); // Convert to "YYYY-MM-DD"
          }
          return null; // Return null for invalid formats
        };
        const parsedDate = dateValue ? parseCustomDate(dateValue) : null;
        const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());

        console.log(`Validating user: ${Name}`);
        console.log(`Name Valid: ${isValidName}`);
        console.log(`Amount Valid: ${isValidAmount}`);
        console.log(`Date Valid: ${isValidDate}`);

        return new User({
          name: Name,
          amount: isValidAmount ? numericAmount  : 0,
          dob: isValidDate ? parsedDate : new Date(),
          verified: isValidName && isValidAmount && isValidDate,
          filename: filename,
          sheetName: sheetName, 
        });
      });

      usersToSave = [...usersToSave, ...sheetUsers];
    });

    if (usersToSave.length === 0) {
      return res.status(400).json({ message: "No valid data found in the uploaded file" });
    }
    await User.insertMany(usersToSave);

    res.status(201).json({ message: "Users uploaded successfully" });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
