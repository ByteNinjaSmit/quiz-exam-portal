import React from 'react';
import { Link } from 'react-router-dom';

const Error = () => {
  return (
    <section className="bg-cover bg-center bg-no-repeat h-screen" style={{ backgroundImage: 'url(https://cdnb.artstation.com/p/assets/images/images/026/598/251/large/hopiz-art-breaking-bx-art-00000.jpg?1589213926)' }}>
      <div className="bg-opacity-50 bg-black h-full flex items-center justify-center">
        <div className="text-center text-white p-8 lg:p-16">
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-4 text-red-500">PAGE NOT FOUND</h1>
          <h2 className="text-3xl lg:text-5xl mb-4">ERROR 404</h2>
          <p className="text-lg lg:text-xl mb-4">Sorry, the page you are looking for could not be found.</p>
          <Link to="/" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-lg transition duration-300">Go Back Home</Link>
        </div>
      </div>
    </section>
  );
}

export default Error;