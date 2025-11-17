class IMATQuizEngine {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timeLeft = 0;
        this.timer = null;
        this.quizType = ''; // 'practice', 'quick-quiz', 'mock-exam'
    }

    // Load questions from JSON
    async loadQuestions(category = 'multipleChoice') {
        try {
            const response = await fetch('../data/questions.json');
            const data = await response.json();
            this.questions = data[category];
            return this.questions;
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    }

    // Start a quick quiz (20 questions, 20 minutes)
    async startQuickQuiz() {
        this.quizType = 'quick-quiz';
        await this.loadQuestions('multipleChoice');
        this.questions = this.shuffleArray(this.questions).slice(0, 20);
        this.timeLeft = 20 * 60; // 20 minutes in seconds
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.startTimer();
        this.displayCurrentQuestion();
    }

    // Start full mock exam (IMAT structure)
    async startMockExam() {
        this.quizType = 'mock-exam';
        // IMAT structure: 60 questions, 100 minutes
        await this.loadQuestions('multipleChoice');
        this.questions = this.shuffleArray(this.questions).slice(0, 60);
        this.timeLeft = 100 * 60; // 100 minutes in seconds
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.startTimer();
        this.displayCurrentQuestion();
    }

    // Timer functionality
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.endQuiz();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Display current question
    displayCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = `
            <div class="question-header">
                <span class="question-number">Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</span>
                <span class="timer" id="timer">20:00</span>
            </div>
            <div class="question-card">
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options ? question.options.map((option, index) => `
                        <label class="option">
                            <input type="radio" name="answer" value="${index}">
                            <span class="option-text">${String.fromCharCode(65 + index)}) ${option}</span>
                        </label>
                    `).join('') : `
                        <div class="numeric-answer">
                            <input type="number" id="numeric-input" placeholder="Enter your answer">
                        </div>
                    `}
                </div>
                <div class="navigation-buttons">
                    ${this.currentQuestionIndex > 0 ? 
                        '<button class="btn-secondary" onclick="quizEngine.previousQuestion()">Previous</button>' : ''}
                    <button class="btn-primary" onclick="quizEngine.nextQuestion()">
                        ${this.currentQuestionIndex === this.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        `;
    }

    nextQuestion() {
        this.checkAnswer();
        this.currentQuestionIndex++;
        this.displayCurrentQuestion();
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    checkAnswer() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        let userAnswer;

        if (currentQuestion.options) {
            // Multiple choice
            const selected = document.querySelector('input[name="answer"]:checked');
            userAnswer = selected ? parseInt(selected.value) : null;
        } else {
            // Numeric answer
            const input = document.getElementById('numeric-input');
            userAnswer = input ? parseFloat(input.value) : null;
        }

        if (userAnswer === currentQuestion.correctAnswer) {
            this.score++;
        }
    }

    endQuiz() {
        clearInterval(this.timer);
        
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = `
            <div class="results-card">
                <h2>Quiz Complete!</h2>
                <div class="score">Your Score: ${this.score} / ${this.questions.length}</div>
                <div class="percentage">${((this.score / this.questions.length) * 100).toFixed(1)}%</div>
                <div class="results-actions">
                    <button class="btn-primary" onclick="quizEngine.reviewAnswers()">Review Answers</button>
                    <button class="btn-secondary" onclick="quizEngine.startQuickQuiz()">Try Another Quiz</button>
                </div>
            </div>
        `;
    }

    shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
}

const quizEngine = new IMATQuizEngine();
