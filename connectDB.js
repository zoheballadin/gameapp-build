import mongoose from "mongoose"
const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGO_STRING)
        console.log("connected to db")
    } catch (error) {
        console.log(error)
    }
}
export default connectDB