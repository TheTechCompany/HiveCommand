import {Router} from 'express';

export const MQTTAuth = (
    getUser: ( username: string, password: string ) => Promise<boolean>,
    isValidResource: (username: string, name: string, permission: "configure" | "permission" | "write" | "read") => Promise<boolean> 
) => {
    const router = Router();

    router.get('/auth/user', async (req, res) => {
        console.log("Auth input", req.query);
        const userQuery : {username: string, password: string} = req.query as any;

        try{
            const isAuthed = await getUser(userQuery.username, userQuery.password);
            if(isAuthed){
                console.log("Auth output true", req.query);
                res.send('allow device hive-command');
            }else{
                console.log("Auth output false", req.query);
                res.send('deny')
            }
        }catch(e){
            console.log("Auth output true", req.query, e);
            res.send('deny')
        }
    });

    router.get('/auth/vhost', (req, res) => {
        res.send("allow");
    });

    router.get('/auth/resource', async (req, res) => {
        const { username, name, permission } = req.query as any;

        try{
            const isValid = await isValidResource(username, name, permission);

            if(name.indexOf('amq.') > -1 || isValid){
                return res.send("allow");
            }else{
                console.log("Resources failed ", req.query)
            }

            console.log("Deny resource", name, name.indexOf('amq') > -1, name.match(/amq\..*/) != null);

            return res.send('allow');
        }catch(e){
            console.error("Resource error", e)
            res.send('deny');
        }
    });

    router.get('/auth/topic', (req, res) => {
        res.send('allow');
    });

    return router;
}