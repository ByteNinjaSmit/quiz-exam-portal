import React, { useEffect, useState } from "react";
import { FaArrowRight, FaUserFriends, FaClock, FaBrain, FaPlayCircle, FaTrophy, FaChartLine, FaUserGraduate, FaQuestionCircle } from "react-icons/fa";
import { BsLightningCharge, BsBarChart } from "react-icons/bs";
import { BsArrowRight } from "react-icons/bs";
import { useAuth } from "../store/auth";
import { Navigate, useLocation,Link} from "react-router-dom";
import axios from "axios";

const HomePage = () => {
    const { isLoading, isDeveloper, API, isLoggedIn} = useAuth();
    const location = useLocation();
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [leaderboardData, setLeaderboardData] = useState([]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const leaderboardResponse = await axios.get(`${API}/api/exam/get/leaderboard`);
                if(leaderboardResponse.status===200){
                    setLeaderboardData(leaderboardResponse.data.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [API]);

    const features = [
        {
            icon: <BsLightningCharge className="text-4xl text-yellow-500" />,
            title: "Quick Challenges",
            description: "Test your knowledge with rapid-fire questions across various topics"
        },
        {
            icon: <FaBrain className="text-4xl text-blue-500" />,
            title: "Learn & Grow",
            description: "Enhance your skills through interactive learning experiences"
        },
        {
            icon: <BsBarChart className="text-4xl text-green-500" />,
            title: "Track Progress",
            description: "Monitor your improvement with detailed performance analytics"
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Create Account",
            description: "Sign up in seconds to begin your learning journey"
        },
        {
            number: "02",
            title: "Choose Topic",
            description: "Select from various subjects that interest you"
        },
        {
            number: "03",
            title: "Start Quiz",
            description: "Challenge yourself and compete with others"
        }
    ];

    const leaderboard = [
        { name: "John Doe", score: 980, avatar: "images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
        { name: "Jane Smith", score: 875, avatar: "images.unsplash.com/photo-1494790108377-be9c29b29330" },
        { name: "Alex Johnson", score: 860, avatar: "images.unsplash.com/photo-1527980965255-d3b416303d12" }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Student",
            quote: "This platform has revolutionized how I prepare for exams!",
            avatar: "images.unsplash.com/photo-1494790108377-be9c29b29330",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Professional",
            quote: "The best quiz platform I've ever used. Highly recommended!",
            avatar: "images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
            rating: 5
        },
        {
            name: "Emily Davis",
            role: "Teacher",
            quote: "An excellent tool for both teaching and learning.",
            avatar: "images.unsplash.com/photo-1438761681033-6461ffad8d80",
            rating: 5
        }
    ];
    const howItWorks = [
        {
            step: 1,
            title: "Sign Up",
            description: "Create your account in seconds",
            icon: <FaUserGraduate className="text-3xl text-white" />
        },
        {
            step: 2,
            title: "Choose Quiz",
            description: "Select from various categories",
            icon: <FaQuestionCircle className="text-3xl text-white" />
        },
        {
            step: 3,
            title: "Start Learning",
            description: "Begin your knowledge journey",
            icon: <FaPlayCircle className="text-3xl text-white" />
        }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1>Loading ...........</h1>
            </div>
        );
    }
    if (isDeveloper && location.pathname === "/") {
        return <Navigate to="/developer/dev/dashboard" />;
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-screen bg-gradient-to-r from-indigo-600 to-purple-600">
                <img
                    src="images.unsplash.com/photo-1516321318423-f06f85e504b3"
                    alt="Hero Background"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
                />
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Challenge Your Knowledge!</h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl">Join thousands of learners pushing their boundaries through interactive quizzes</p>
                    <div className="space-x-4">
                        <Link to={ isLoggedIn ? '/user/dashboard' : '/login'}>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-full font-semibold transform transition hover:scale-105">
                            Start Quiz Now
                        </button>
                        </Link>
                        <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-900 transform transition">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us?</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            {/* <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-purple-100 rounded-xl p-8">
                  <div className="text-4xl font-bold text-purple-600 mb-4">{step.number}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <FaArrowRight className="text-2xl text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div> */}
            <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorks.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-6">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-gray-800">{step.title}</h3>
                                    <p className="text-gray-600 text-center">{step.description}</p>
                                </div>
                                {index < howItWorks.length - 1 && (
                                    <div className="hidden md:block absolute top-8 left-full w-full transform -translate-x-1/2">
                                        <BsArrowRight className="text-4xl text-indigo-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Leaderboard Section */}
            {
                leaderboardData && (
                    <div className="py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4">
                            <h2 className="text-4xl font-bold text-center mb-16">Top Performers</h2>
                            <div className="max-w-3xl mx-auto">
                                {leaderboardData?.map((user, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl mb-4 shadow-sm">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                {/* <img
                                                // src={user.avatar}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            /> */}
                                                {index === 0 && <FaTrophy className="absolute -top-2 -right-2 text-yellow-500 text-xl" />}
                                            </div>
                                            <span className="font-semibold">{user.name}</span>
                                        </div>
                                        <span className="text-purple-600 font-bold">{user.totalPoints} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }


            {/* Testimonials Section */}
            {/* <div className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">What Our Users Say</h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-purple-50 p-8 rounded-xl">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <img
                                            src={testimonial.avatar}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <div className="font-semibold">{testimonial.name}</div>
                                            <div className="text-gray-600 text-sm">{testimonial.role}</div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div> */}
            {/* Testimonials Section */}
            {/* <div className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">What Our Users Say</h2>
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={`https://${testimonial.avatar}`}
                                            alt={testimonial.name}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="ml-4">
                                            <h3 className="font-bold text-gray-800">{testimonial.name}</h3>
                                            <p className="text-gray-600">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div> */}
            {/* Final CTA Section */}
            <div className="py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl font-bold mb-6">Ready to Test Your Knowledge?</h2>
                    <p className="text-xl mb-8">Join thousands of users already challenging themselves daily</p>
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-12 py-4 rounded-full font-semibold text-lg transform transition hover:scale-105">
                        Start Your Journey Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;