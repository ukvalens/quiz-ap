let playerName = ""; // Default name  
let questions = [];  
let currentQuestionIndex = 0;
let score = 0;


function updatePlayerName(name) {
    playerName = name || "";
    document.getElementById("name-display").innerText = playerName;
}


document.getElementById('upload-button').addEventListener('click', () => {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            updateQuestionsFromExcel(jsonData);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select Examination file to upload.');
    }
});


function updateQuestionsFromExcel(data) {
    questions = []; 

    data.forEach((row, index) => {
        if (row.length < 2) {  
            alert(`Row ${index + 1}  Please check your missing file.`);
            return; 
        }

        const questionText = row[0]; 
        const correctIndex = parseInt(row[row.length - 1], 10); 
        const answerOptions = row.slice(1, -1); 

        
        if (!questionText || answerOptions.length === 0 || answerOptions.some(answer => !answer)) {
            alert(`Row ${index + 1} contains an empty question or answer. Please check your  file.`);
            return; 
        }

        
        if (isNaN(correctIndex) || correctIndex < 1 || correctIndex > answerOptions.length) {
            alert(`Row ${index + 1} has an invalid correct answer index. It must be between 1 and ${answerOptions.length}.`);
            return; 
        }

        const answers = answerOptions.map((text, i) => ({
            text,
            correct: correctIndex === i + 1 
        }));

        questions.push({
            question: questionText,
            answers
        });
    });

    if (questions.length > 0) {
        alert("Questions have been loaded from the Excel file!");
        startQuiz(); 
    } else {
        alert("No valid questions were loaded from the examination file.");
    }
}


function startQuiz() {
    currentQuestionIndex = 0;
    score = 0; 
    document.getElementById("next-btn").style.display = "none"; 
    document.getElementById("question").style.display = "block"; 
    showQuestion(); 
    updateScoreDisplay(); 
}


function updateScoreDisplay() {
    document.getElementById("score-count").innerText = score;
}


function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) return; 

    document.getElementById("question").innerHTML = `${currentQuestionIndex + 1}. ${currentQuestion.question}`;
    const answerButtons = document.getElementById("answer-buttons");
    answerButtons.innerHTML = ''; 

    currentQuestion.answers.forEach((answer) => {
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        button.addEventListener("click", () => selectAnswer(answer.correct));
        answerButtons.appendChild(button);
    });
}


function selectAnswer(isCorrect) {
    const answerButtons = document.getElementById("answer-buttons").children;
    Array.from(answerButtons).forEach(button => {
        button.disabled = true; 
        if (isCorrect) {
            button.classList.add("correct");
            score++; 
        } else {
            button.classList.add("wrong");
        }
    });

    updateScoreDisplay(); 
    document.getElementById("next-btn").style.display = "block"; 
}


document.getElementById("next-btn").addEventListener("click", () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
        document.getElementById("next-btn").style.display = "none"; 
    } else {
        const finalScore = (score / questions.length) * 12.5; 
        alert(`Quiz finished! Your final score is ${finalScore} out of 50.`); 
        downloadReport(finalScore); 
        resetQuiz(); 
    }
});


function downloadReport(finalScore) {
    const reportContent = `Player Name: ${playerName}\nFinal Score: ${(finalScore)}`;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.getElementById("download-report");
    downloadLink.href = url;
    downloadLink.style.display = 'inline'; 
}


function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    questions = []; // Clear questions
    document.getElementById("question").style.display = "none"; 
    document.getElementById("answer-buttons").innerHTML = ''; 
    document.getElementById("next-btn").style.display = "none"; 
    document.getElementById("download-report").style.display = 'none'; 
}


document.getElementById("next-btn").style.display = "none"; 


updatePlayerName(prompt("Enter your name:")); 