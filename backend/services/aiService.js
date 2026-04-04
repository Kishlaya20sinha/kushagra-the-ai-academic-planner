const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

exports.parseDocuments = async (files) => {
  // Define structure of what we exect from Gemini Model
  const prompt = `
  You are an expert AI Academic Planner and "Personal University Chief of Staff". I have uploaded 5 files: a Registration Slip, a Syllabus, a Routine, an Academic Calendar, and a Holiday Calendar.
  
  CRITICAL CONTEXT: Today's exact date is ${new Date().toDateString()}. Use this date to ground any logic but extract raw dates whenever possible.

  Your mission is to carefully analyze all documents and extract a highly structured JSON response that will power a 4-part dashboard.

  Respond strictly with ONLY a JSON object matching this exact structure:
  {
    "subjectSniper": [
      {
        "courseCode": "e.g., CS401",
        "name": "Data Structures",
        "topics": ["Linked Lists", "Trees", "Graphs"],
        "weightageBreakdown": [
          { "testName": "Midsem", "marks": 25 },
          { "testName": "Endsem", "marks": 50 }
        ]
      }
    ],
    "priorityQueue": [
      {
        "taskId": "unique_string_id",
        "subject": "Data Structures",
        "title": "Study Unit 3: Linked Lists",
        "marks": 25,
        "credits": 4,
        "examDate": "2026-03-02",
        "tag": "Critical"
      }
    ],
    "contextualAlerts": [
      {
        "alertType": "Fest Mode",
        "message": "Technika starts in 10 days. I have added 30 extra minutes to your study blocks this week."
      }
    ]
  }

  Important Rules:
  1. Only include subjects listed in the Registration Slip.
  2. Use the Syllabus / Registration to find the "Credits" for each subject (e.g., Labs usually 1.5, core subjects 3 or 4, Constitution of India is 0). Put this exact float in the "credits" field.
  3. Extract the exact date of the exam/quiz from the Academic Calendar and put it in "examDate" (Format YYYY-MM-DD). If no exact date is found for a future exam, reasonably estimate a future date in YYYY-MM-DD.
  4. For Constitution of India, set "credits" to 0. For Summer Training/Internship, also set "credits" to 0 and push the examDate far into the future (e.g. July).
  5. Use the Holiday/Academic Calendar to inform 'contextualAlerts' (e.g., Athletic Meets, Fests).
  6. The JSON must be valid and contain NO markdown formatting around it.
  `;

  try {
    // Re-initialize to guarantee we have the API key after dotenv has fully loaded
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const uploadedFiles = [];

    // Upload files to Gemini using the File API
    for (const fileKey in files) {
      const fileArray = files[fileKey];
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        console.log(`Uploading ${file.originalname} to Gemini...`);
        const uploadResponse = await fileManager.uploadFile(file.path, {
          mimeType: file.mimetype,
          displayName: file.originalname,
        });
        console.log(`Uploaded ${file.originalname} to ${uploadResponse.file.uri}`);
        uploadedFiles.push({
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri
          }
        });
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Call the model with all the uploaded files + the prompt
    console.log("Analyzing contents in Gemini 2.5 Flash context window...");
    const result = await model.generateContent([
      ...uploadedFiles,
      { text: prompt }
    ]);

    const responseText = result.response.text();

    // Clean up Markdown code block if present
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('AI Document Parsing failed. Details: ' + (error.message || error));
  }
};
