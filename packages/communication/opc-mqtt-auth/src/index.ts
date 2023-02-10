import {Router} from 'express';

export const MQTTAuth = (
    getUser: ( username: string, password: string ) => Promise<boolean>,
) => {
    const router = Router();

    router.get('/auth/user', async (req, res) => {
        console.log(req.query);
        const userQuery : {username: string, password: string} = req.query as any;

        try{
            const isAuthed = await getUser(userQuery.username, userQuery.password);
            if(isAuthed){
                res.send('allow device hive-command');
            }else{
                res.send('deny')
            }
        }catch(e){
            res.send('deny')
        }
    });

    router.get('/auth/vhost', (req, res) => {
        res.send("allow");
    });

    router.get('/auth/resource', (req, res) => {
        if((req.query.name === 'tasks' && (req.query.permission === 'configure' || req.query.permission === "permission")) || req.query.name === 'amq.default'){
            return res.send("allow");
        }

        res.send('allow');
    });

    router.get('/auth/topic', (req, res) => {
        res.send('allow');
    });

    return router;
}