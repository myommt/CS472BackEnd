import express, { json } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './router.ts';
import dotenv from 'dotenv';
dotenv.config();

/*init*/
const application = express();


/*middleware*/
application.use(morgan('dev'));
application.use(cors());
application.use(bodyParser.json());

application.use('/policies', router);
application.use('/users', router);

application.listen(3000, () => console.log(`listening to 3000`));