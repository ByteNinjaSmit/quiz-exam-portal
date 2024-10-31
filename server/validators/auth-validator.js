const { z, ZodAny } = require("zod");

// creating an object schema


const logininSchema = z.object({
  username: z
    .string({ required_error: "Name is Required" })
    .trim()
    .min(3, { message: "Name Must be at least of 3 characters. " })
    .max(255, { message: "Name Must not be more than 255 characters. " }),
  password: z
    .string({ required_error: "Password is Required" })
    .trim()
    .min(7, { message: "Password Must be at least of 6 characters. " })
    .max(1024, { message: "Password can't be grater than 1024 characters." }),
});



const signupSchema = logininSchema.extend({
  email: z
    .string({ required_error: "Email is Required" })
    .trim()
    .email({ message: "Invalid Email address" })
    .min(3, { message: "email Must be at least of 3 characters. " })
    .max(255, { message: "email Must not be more than 255 characters. " }),

  phone: z
    .string({ required_error: "Phone number is Required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(20, { message: "Name Must not be more than 20 characters. " }),
});


module.exports = { signupSchema, logininSchema };