import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../store/auth.jsx"
import { ChevronRight, Menu, X } from "lucide-react"
import { AcmeLogo } from "./AcmeLogo.jsx"

export default function MainNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { isLoggedIn, LogoutUser, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest("nav")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isMenuOpen])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const menuItems = [
    { name: "Home", to: "/" },
    ...(isLoggedIn
      ? [
          ...(!isAdmin ? [{ name: "Dashboard", to: `/user/dashboard` }] : []),
          ...(isAdmin ? [{ name: "Dashboard", to: `/admin/dashboard` }] : []),
          { name: "About", to: "/about" },
          { name: "FAQ", to: "/faq" },
        ]
      : []),
    !isLoggedIn && { name: "About", to: "/about" },
    !isLoggedIn && { name: "FAQ", to: "/faq" },
  ].filter(Boolean)

  const LoginUser = () => {
    navigate("/login")
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md shadow-sm top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Toggle */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleMenu()
              }}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-700 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 relative"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <span className="absolute inset-0" onClick={toggleMenu}></span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              <AcmeLogo />
              <p className="font-bold text-inherit">ByteQuiz</p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:justify-center flex-1 px-8">
            <div className="flex space-x-4">
              {menuItems.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    location.pathname === item.to
                      ? "text-blue-600 font-bold"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Login/Logout Button */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <button
                onClick={LogoutUser}
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
              >
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button
                  onClick={LoginUser}
                  className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`sm:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-2.5 bg-gradient-to-b from-white to-blue-50/50 backdrop-blur-sm">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                location.pathname === item.to
                  ? "text-blue-600 bg-blue-100/70 shadow-sm"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 hover:translate-x-1"
              }`}
            >
              <div className="flex justify-between items-center">
                {item.name}
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-200 ${
                    location.pathname === item.to ? "text-blue-500" : "text-gray-400"
                  }`}
                />
              </div>
            </Link>
          ))}

          {/* Mobile Login/Logout */}
          <div className="pt-2">
            {isLoggedIn ? (
              <button
                onClick={LogoutUser}
                className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Log Out
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            ) : (
              <Link to="/login" className="block w-full">
                <button className="w-full flex justify-between items-center px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
                  Log In
                  <ChevronRight className="h-4 w-4 text-white" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

