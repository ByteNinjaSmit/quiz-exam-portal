import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@nextui-org/react";
import { AcmeLogo } from "./AcmeLogo.jsx";
import { useAuth } from "../../store/auth.jsx";

export default function MainNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, LogoutUser } = useAuth(); // Custom hook from AuthContext

  const menuItems = [
    { name: "Home", to: "/" },
    ...(isLoggedIn
      ? [
          { name: "Dashboard", to: `/dashboard` },

          { name: "Help & Feedback", to: "/contact" },
          { name: "FAQ", to: "/faq" },
          { name: "Log Out", onClick: LogoutUser },
        ]
      : []),
    !isLoggedIn && { name: "Help & Feedback", to: "/contact" },
    !isLoggedIn && { name: "FAQ", to: "/faq" },
    !isLoggedIn && { name: "Rules", to: "/rule-regulations" },
    ...(isLoggedIn ? [] : [{ name: "Log In", to: "/login" }]), // For when not logged in
  ].filter(Boolean); // filter to remove falsey values
  


  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link to="/" color="foreground" style={{ color: "inherit", textDecoration: "none" }}>
            <AcmeLogo />
            <p className="font-bold text-inherit">ACES</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.slice(0, 4).map((item) => (
          <NavbarItem key={item.name}>
            <Link
              to={item.to}
              style={{ color: "inherit", textDecoration: "none" }}
              className={location.pathname === item.to ? "font-bold text-blue-500" : ""}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          {isLoggedIn ? (
            <Button color="danger" onClick={LogoutUser} variant="flat">
              Logout
            </Button>
          ) : (
            <Link to={`/login`}>
            <Button  color="primary" variant="flat">
              Login
            </Button>
            </Link>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <Link
              to={item.to}
              style={{ color: "inherit", textDecoration: "none", width: "100%" }}
              className={location.pathname === item.to ? "font-bold text-blue-500" : ""}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
