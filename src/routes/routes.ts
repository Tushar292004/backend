import express, { Request, Response } from "express";
import User from "../models/User"; // Import the User model

const router = express.Router();

interface ExcelData {
    filename: string;
    sheetName: string;
    data: Array<Record<string, any>>; // Represents rows in the Excel sheet
}

router.post("/upload", async (req: Request, res: any) => {
  try {
    console.log("Received Request Body:", req.body);
    const usersData: ExcelData = req.body; // Assuming JSON is sent in request body
  
    if (!usersData || !usersData.filename || !usersData.data) {
      return res.status(400).json({ error: "Invalid file data received" });
    }
  
    console.log("Received Excel Data:", usersData);

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({ message: "Invalid or empty data" });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const usersToSave = usersData.map((user) => {
      const { Name, Amount, Date, Verified, filename } = user;

      // Validation checks
      const isValidName = typeof Name === "string" && Name.trim() !== "";
      const isValidAmount = typeof Amount === "number" && Amount > 0;

      const parsedDate = new Date(Date);
      const isValidDate = !isNaN(parsedDate.getTime()) && parsedDate.getMonth() === currentMonth && parsedDate.getFullYear() === currentYear;

      console.log(`Validating user: ${Name}`);
      console.log(`Name Valid: ${isValidName}`);
      console.log(`Amount Valid: ${isValidAmount}`);
      console.log(`Date Valid: ${isValidDate}`);


      return new User({
        name: Name,
        amount: isValidAmount ? Amount : 0,
        dob: isValidDate ?  parsedDate  : new Date(),
        verified: isValidName && isValidAmount && isValidDate,
        filename: filename || "NoFilename"
      });
    });

    await User.insertMany(usersToSave);

    res.status(201).json({ message: "Users uploaded successfully" });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
