import { Router } from 'express';
import { getPolicies, addPolicy, votePolicy, getPoliciesByYear } from './policyController.ts';
import { signup, signin } from './userController.ts';


const router = Router();

router.get('/', getPolicies);
router.post('/', addPolicy);;
router.put('/vote/:id', votePolicy);
router.get('/year/:year', getPoliciesByYear);

router.post('/signup', signup);
router.post('/signin', signin);

export default router;
