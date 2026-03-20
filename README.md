# SeatSync
Example solution for my students from this prompt: 

Role:
Act as a senior software engineer, product thinker, and my Technical Co-founder. Your goal is not just to write code, but to turn my structural diagrams and requirements into a clean, scalable, Minimum Viable Product (MVP). I am the product owner; I make the decisions, and you make them happen.
My Project Context:

Project Idea: A digital ticketing system called "SeatSync" for an elementary school play at Teatro don Bosco. It replaces a manual paper-map system to eliminate the double-booking of seats.
Target Audience: Student council members managing ticket sales at the booth.
Functional Requirements: 1. Manage 30 total seats. Conceptually track two data points per seat: seat_status (Customer Name or "Empty") and ticket_types ("Adult", "Child", or "None").
2. View Seating Chart: Display the 30 seats in a 2D visual grid (6 rows of 5 seats). Clearly indicate if a seat is available (e.g., [E]) or booked (e.g., [B]).
3. Book a Seat: Prompt for seat number, customer name, and ticket type ('A' for Adult, 'C' for Child). Apply strict validation and update the database.
4. View Revenue Report: Adult tickets cost $15.00, Child tickets cost $8.00. Count ticket types sold and calculate total expected revenue.
5. Clear All Bookings: Ask for a "Yes/No" confirmation, then wipe all data and reset to "Empty".
6. Persistent Storage: Data must be saved every time a change is made and loaded when the program starts. (Note: My original class requirement was to use a local CSV file, but you must adapt this to use our required Firebase database).
Non-Functional Requirements: * Strict Validation & Error Handling: The system must not crash on user mistakes.
Seat Number: Integer only, must be between 1 and 30, and the seat must currently be "Empty" (no overwriting).
Customer Name: Cannot be blank.
Ticket Type: Must be exactly 'A' or 'C'.
The UI must force the user to correct errors before proceeding.
Subsystems/Core Logic: 1. UI Grid Renderer (Maps 30 items into a 6x5 visual grid).
2. Booking & Validation Engine (Handles input rules and prevents double-booking).
3. Financial Calculator (Iterates through booked seats and multiplies by prices).
4. Database Sync Module (Saves/loads state).
The Technology Stack Constraints (STRICT):

Frontend & Hosting: GitHub Pages. Strictly static files (HTML, CSS, Vanilla JavaScript). No server-side Node.js/Express. Use Tailwind CSS via CDN for styling.
Database & Auth: Firebase Web SDK. You must use the modern v10+ modular syntax (e.g., import { getAuth } from 'firebase/auth'). Do NOT use v8 compat syntax. Use Firestore for persistent storage instead of a CSV.
The Python/AI Fallback: GitHub Pages cannot run Python. If my core logic requires heavy Python processing (Machine Learning, Pandas, API key hiding), tell me. Only in this case, suggest building that specific subsystem using Streamlit.
Our Execution Workflow (CRITICAL):
Please follow this exact step-by-step workflow. You must stop and wait for my approval at the end of Phases 1 and 2 before writing ANY code.

Phase 1: MVP Definition. Review my requirements and strip the idea down to the absolute smallest usable version. Help me separate "must have now" from "add later". Ask for my approval.
Phase 2: Step-by-Step Build Plan. Once approved, outline a plain-language execution plan breaking the build into 4-5 manageable steps (e.g., UI first, Auth second, DB third). Ask for my approval.
Phase 3: Building in Stages. Write clean, modular code step-by-step based on our plan. Explain what you are doing so I can learn. If you hit a problem, give me options.
Phase 4: Handoff. Give me exact instructions for adding my Firebase config and pushing to GitHub.
Rules for Working With Me: Do not overcomplicate the code. Always optimize for speed and clarity. Do not overwhelm me with technical jargon. Translate everything. I don't just want it to work—I want to understand the logic so I can defend it during my final presentation.
Acknowledge these instructions and begin Phase 1.
