const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

const questions = [
  {
    question: "Why was the picture sent to jail? A. Because it was part of a shady deal B. It was framed! C. It couldn't develop an alibi. ",
    answer: "B"
  },
  {
    question: "What is the national animal of Scotland?",
    answer: "Unicorn"
  },
  {
    question: "What do you call a female elephant? A. Cow B. Doe C. Mare",
    answer: "A"
  }
];

let score = 0;
let answeredQuestions = 0;

document.querySelectorAll('.speakBtn').forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(questions[index].question);
    synth.speak(utterance);
  });
});

    //score berekenen
document.querySelectorAll('.answerBtn').forEach((btn, index) => {
  btn.addEventListener('click', () => {
    recognition.start();
    recognition.onresult = function(event) {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      let resultText = '';

      const correctAnswer = questions[index].answer.toLowerCase();
      if (speechResult.includes(correctAnswer.toLowerCase())) {
        resultText = 'Correct!';
        score++;
      } else {
        resultText = `Incorrect. The correct answer is ${questions[index].answer}.`;
      }

      document.querySelectorAll('.result')[index].innerText = resultText;
      document.getElementById('score').innerText = `Score: ${score}/3`;
        
      //message update over score
      answeredQuestions++;
      if (answeredQuestions === questions.length) {
        let finalMessage = '';
        if (score === 3) {
          finalMessage = 'Excellent! You got all the answers right!';
        } else if (score === 2) {
          finalMessage = 'Good job! You got 2 out of 3 correct!';
        } else if (score === 1) {
          finalMessage = 'Nice try! You got 1 out of 3 correct.';
        } else {
          finalMessage = 'Better luck next time! You got none correct.';
        }
        document.getElementById('finalMessage').innerText = finalMessage;
        const utterance = new SpeechSynthesisUtterance(finalMessage);
        synth.speak(utterance);
      }
    };
  });
});
