import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import FaqHero from '/images/faq.jpg'; 
import { Link } from "react-router-dom";
const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "Account & Login",
      questions: [
        {
          q: "How do I create an account on ByteQuiz?",
          a: "You Can't Create an Account, Your Department provide you username and password."
        },
        {
          q: "What should I do if I forget my password?",
          a: "Click on Visit Your Department."
        },
        {
          q: "Can I change my registered username or any data?",
          a: "No, once registered, you cannot change your username and anyother. However, you can update other profile details."
        }
      ]
    },
    {
      category: "Quiz Participation",
      questions: [
        {
          q: "How do I join a quiz?",
          a: "You can browse available quizzes on the homepage and click 'Join Quiz' to participate."
        },
        {
          q: "Is there a time limit for each quiz?",
          a: "Yes, each quiz has a predefined time limit. Make sure to complete it before the timer runs out."
        },
        {
          q: "Can I reattempt a quiz?",
          a: "It depends on the quiz settings. Some quizzes allow reattempts, while others are one-time only."
        }
      ]
    },
    {
      category: "Scoring & Leaderboard",
      questions: [
        {
          q: "How is the quiz score calculated?",
          a: "Scores are based on correct answers and the time taken to complete the quiz."
        },
        {
          q: "Where can I see my ranking?",
          a: "Your ranking is displayed on the leaderboard. You can also view your past performances in your profile."
        },
        {
          q: "Are there rewards for top scorers?",
          a: "Yes! Some quizzes offer rewards for top performers. Check the quiz details for more information."
        }
      ]
    },
    {
      category: "Technical & Support",
      questions: [
        {
          q: "The quiz is not loading properly. What should I do?",
          a: "Try refreshing the page. If the issue persists, clear your browser cache or try using a different browser."
        },
        {
          q: "Can I play the quiz on mobile?",
          a: "Yes, ByteQuiz is fully responsive and works on both mobile and desktop devices."
        },
        {
          q: "Whom should I contact for support?",
          a: "You can reach out to us via email at smitrajbankar11@gmail.com for any technical issues."
        }
      ]
    }
  ];
  

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-fixed bg-center w-full overflow-hidden">
        <img
          className="opacity-90 w-full h-full object-cover scale-110"
          src={FaqHero}
          alt="FAQ Hero"
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-[95%] lg:max-w-[800px]">
          <h1 className="text-6xl font-josefins font-bold">FAQ</h1>
          <p className="text-xl mt-4 font-josefins">Frequently Asked Questions</p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-purple-500">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                      onClick={() => toggleQuestion(categoryIndex + '-' + questionIndex)}
                    >
                      <span className="font-semibold">{item.q}</span>
                      {openIndex === categoryIndex + '-' + questionIndex ? (
                        <ChevronUp className="w-5 h-5 text-purple-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-500" />
                      )}
                    </button>
                    {openIndex === categoryIndex + '-' + questionIndex && (
                      <div className="px-6 py-4 bg-gray-50">
                        <p className="text-gray-600">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;