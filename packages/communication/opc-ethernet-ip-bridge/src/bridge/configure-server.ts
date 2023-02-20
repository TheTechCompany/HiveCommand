import express from "express";
import bodyParser from 'body-parser'
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

const CONFIGURE_PORT = 8020;

export const configureServer = (PLC: {templateList?: any, tagList?: any[]}, listenTags: any) => {
    const app = express();

    app.use(bodyParser.json())

    app.use(express.static(path.join(__dirname, '../configurator')))

    app.get('/api/tags', (req, res) => {

        //Check if tag already covered by template rule ?

        const tags = PLC?.tagList?.map((tag: any) => ({
            name: tag.name,
            type: tag.type.typeName,
            children: (tag.type.structureObj && tag.type.typeName !== "STRING") ? Object.keys(tag.type.structureObj || {}).map((x) => ({name: x, type: (tag.type.structureObj as any)?.[x]})) : []
        }));

        res.send(tags)
    });

    app.get('/api/templates', (req, res) => {
        const templates = Object.keys(PLC?.templateList || {}).map((templateKey: any) => {
            let template = PLC?.templateList?.[templateKey];
            
            return {
                name: template?._name,
                children: template?._members
            }
        })
        res.send(templates)
    })

    app.get('/api/whitelist', (req, res) => {

        //Parse whitelist into tags by including templates

        if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

        let {tags, templates} = JSON.parse(readFileSync(listenTags, 'utf-8')) || {tags: [], templates: []};
        
        res.send({tags, templates})

    })

    app.post('/api/whitelist', (req, res) => {

        if(!listenTags) return res.send({error: "Please specify --tags in bridge startup"});

        let {tags, templates} = JSON.parse(readFileSync(listenTags, 'utf8')) || {tags: [], templates: []};

        if(!tags) tags = [];
        if(!templates) templates = [];

        let change = {
            type: req.body.type, //tag | template
            add: req.body.add, //add or remove from whitelist
            path: req.body.path, //name.child.child
            name: req.body.name
        }

        
        const deleteNode = (node: any, path: string | undefined, name: string, currentPath?: string) => {
            let path_parts = ([undefined] as any).concat( path ? path.split('.') : [] );
            let curr_path_parts = (currentPath?.split('.') || []).length;

            if(currentPath == path){
                node.children = node.children.filter((a: any) => a.name != name)
            }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0){
                for(let i = 0; i < node.children.length; i++){
                    if(node.children[i].name == path_parts[curr_path_parts + 1]){
                        deleteNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name);
                    }
                }
            }
        }
      
        const insertNode = (node: any, path: string | undefined, name: string, currentPath?: string) => {

            let path_parts = ([undefined] as any).concat(path ? path.split('.') : []);
            let curr_path_parts = (currentPath?.split('.') || [])?.length;

            if(currentPath == path){
                if(node.children?.map((x: any) => x.name).indexOf(name) < 0){
                    node.children?.push({name, children: []});
                }
            }else if(node.name == path_parts[curr_path_parts] && node.children.length > 0) {
                for(let i = 0; i < node?.children?.length; i++){
                    if(node.children[i].name == path_parts[curr_path_parts + 1]){
                        insertNode(node.children[i], path, name, currentPath ? `${currentPath}.${node.children[i].name}` : node.children[i].name)
                    }
                }
            }
        }

        
        if(change.add){
            insertNode({children: change.type == 'tag' ? tags : templates}, change.path, change.name)
        }else{
            deleteNode({children: change.type == 'tag' ? tags : templates}, change.path, change.name)
        }

        writeFileSync(listenTags, JSON.stringify({tags, templates}), 'utf8')

        res.send({success: true})
    })

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, './configurator/index.html'));
    })

    app.listen(CONFIGURE_PORT, () => {
        console.log(`Configure live on ${CONFIGURE_PORT}`)
    });
    return app;

}