import React from "react";
import { Users, Award, Clock, Building2 } from "lucide-react";
import TeamMember1 from "/images/team1.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      {/* About Section */}
      <section className="py-8 px-6 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold font-josefins mb-6">Who We Are</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            ByteQuiz is an innovative web app designed for students to engage in
            interactive quizzes, coding contests, and problem-solving challenges
            akin to LeetCode. Our mission is to create an engaging and
            competitive environment that enhances learning and technical skills.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Meet Our Developer Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Smitraj Bankar",
                role: "Developer",
                image: TeamMember1,
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {member.name}
                  </h3>
                  <p className="text-violet-600 font-bold">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
