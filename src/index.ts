import express, { Express } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userSignUpRoutes from './routes/userSignUpRoutes';
import userLoginRoutes from './routes/userLoginRoutes';
import cors from 'cors';
import userProfileUpdateRoutes from './routes/userProfileUpdateRoutes'
import './model/userModel';



dotenv.config();

const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY!;

const app: Express = express();


app.use(express.json());

app.use(morgan('dev'));
app.use(cors({
  exposedHeaders: ["*"]
}));

app.use('/user', userSignUpRoutes);
app.use('/user', userLoginRoutes);
app.use('/user', userProfileUpdateRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
