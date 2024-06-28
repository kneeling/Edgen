async function getOpenAICompletion(apiKey, message) {
   const url = "http://192.168.1.244:4444";


   const params = {
       query: message
   };


   try {
       const response = await fetch(url, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(params)
       });


       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }


       const result = await response.json();
       console.log(result.resp);
       return result.resp;
   } catch (error) {
       console.error('Error:', error);
       return null;
   }
}


function isBackgroundColorOrange(element) {
   const bgColor = window.getComputedStyle(element).backgroundColor;
   const hexColor = rgbToHex(bgColor);
   return hexColor === '#f78d26';
}


function rgbToHex(rgb) {
   const result = rgb.match(/\d+/g).map(Number);
   return "#" + result.map(x => {
       const hex = x.toString(16);
       return hex.length === 1 ? "0" + hex : hex;
   }).join('');
}


function findOrangeBackgroundIndex() {
   const navBtnList = document.querySelector("#navBtnList");
   if (!navBtnList) {
       alert("session timed out");
       return -1;
   }
   const listItems = navBtnList.querySelectorAll('li');


   for (let i = 0; i < listItems.length; i++) {
       const anchor = listItems[i].querySelector('a');
       if (anchor && isBackgroundColorOrange(anchor)) {
           return i - 1;
       }
   }
   return -1;
}


async function get_question_data() {
   const orangeIndex = findOrangeBackgroundIndex();
   if (orangeIndex === -1) {
       alert("Please refresh the website");
       return;
   }
   console.log("Index with orange background:", orangeIndex);
   const output = await printQuestionDetails(orangeIndex);
   if (!output) {
       alert("Failed to generate question details.");
       return;
   }
   const apiKey = '';
   const responseText = await getOpenAICompletion(apiKey, output);
   alert(responseText);
   if (responseText) {
       clickCorrectAnswer(responseText, orangeIndex);
   } else {
       alert("Failed to get the correct answer from OpenAI.");
   }
}


async function printQuestionDetails(orangeIndex) {
   const questionContainer = document.querySelector("body > div:nth-child(3) > div > div > div.question-container");


   if (questionContainer) {
       const visibleQuestions = questionContainer.querySelectorAll('.Assessment_Main_Body_Content_Question[style=""]');


       if (!visibleQuestions.length) {
           console.error("No visible questions found.");
           return null;
       }


       let output = "";


       visibleQuestions.forEach(question => {
           const questionContents = question.querySelector('.Question_Contents');
           if (questionContents) {
             
               const clonedContents = questionContents.cloneNode(true);
              
              
               const inputs = clonedContents.querySelectorAll('input[type="radio"], input[type="checkbox"]');
               inputs.forEach(input => {
                   const parent = input.parentElement;
                   if (parent) {
                       parent.removeChild(input);
                   }
               });


              
               const labels = clonedContents.querySelectorAll('label');
               labels.forEach(label => {
                   const parent = label.parentElement;
                   if (parent) {
                       parent.removeChild(label);
                   }
               });


              
               const textContent = clonedContents.textContent.trim();
               output += "Relevant Text:\n" + textContent + "\n\n";


               const img = questionContents.querySelector('img');
               if (img) {
                   output += "Image Alt Text:\n" + img.alt + "\n\n";
               }


               const answerChoices = questionContents.querySelectorAll('.answer-choice');
               let choicesArray = [];


               answerChoices.forEach((choice, index) => {
                   const radioBtn = choice.querySelector('input[type="radio"]');
                   const checkboxBtn = choice.querySelector('input[type="checkbox"]');
                   const label = choice.querySelector('label');
                   if ((radioBtn || checkboxBtn) && label) {
                       const choiceText = String.fromCharCode(65 + index) + ": " + label.textContent.trim();
                       choicesArray.push(choiceText);
                   }
               });


              
               choicesArray.sort();


              
               choicesArray.forEach(choiceText => {
                   output += `Answer Choice:\n${choiceText}\n\n`;
               });
           }
       });


       console.log(output);
       return output;
   } else {
       console.log("Question container not found.");
       return null;
   }
}


function clickCorrectAnswer(answer, orangeIndex) {
   const answerIndex = answer.charCodeAt(0) - 65;
   const questionContainer = document.querySelector(`#form${orangeIndex} > div > div > div:nth-child(2) > div:nth-child(2)`);
   if (!questionContainer) {
       alert(answer)
       return;
   }


   const answerChoices = questionContainer.querySelectorAll('.answer-choice');
   console.log("Answer choices:", answerChoices);
   answerChoices.forEach((choice, index) => {
       if (index === answerIndex) {
           const correctChoice = choice.querySelector('input[type="radio"], input[type="checkbox"]');
           if (correctChoice) {
               correctChoice.click();
               console.log(`Answered question with choice: ${answer}`);
           } else {
               alert(`${answer}`);
           }
       }
   });
}


/*
document.addEventListener('keydown', function(event) {
   if (event.key === 'e') {
       console.log("used")
       get_question_data();
   }
});*/


get_question_data();
