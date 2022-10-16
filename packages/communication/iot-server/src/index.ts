import { Router } from 'express'

import jwt from 'jsonwebtoken';
import { PrismaClient } from '@hive-command/data';
import {v4} from 'uuid';

export interface IOTTree {
    path: string;
    type?: string;
    children?: IOTTree[];
}

export class IOTServer {
    public router : Router;

    private client : PrismaClient;

    constructor(){
        this.router = Router()

        this.client = new PrismaClient()
        
        this.mountRoutes();
    }

    mountRoutes(){
        //Check keyphrase against DB issue token
        this.router.post('/handshake', async (req, res) => {
            const { keyphrase } = req.body;

            const device = await this.client.device.findFirst({
                where: {
                    provisionCode: keyphrase,
                    provisioned: false
                }
            });

            // const token = jwt.

            const token = jwt.sign({
                sub: device?.id
            }, 'SECRET')

            res.send({id: device?.id, token})

        })

        const reduceTree = (tree: any[]) : any[] => {
            return tree.reduce((prev, curr) => [...prev, curr, ...reduceTree(curr.children || [])], [])
        }

        const mapTree = (tree: any[], parent?: string) : any[] => {
            return tree.map((treeItem) => {

                let id = v4();

                let children = mapTree(treeItem.children || [], id);

                return {
                    id: id,
                    label: treeItem.label,
                    path: treeItem.path,
                    type: treeItem.type,
                    parentId: parent,
                    // deviceId: "iftwUBXW0FBNpKvlc_Z8S",
                    children
                }

            })
            //.reduce((prev, curr) => [...prev, ...curr], [])
        }
      

        //Rectify context
        this.router.post('/context', async (req, res) => {
            const { tree } = req.body;
            const typedTree : IOTTree[] = tree;

            // const {dataLayout: currentTree} = await this.client.device.findFirst({
            //     where: {
            //         id: "iftwUBXW0FBNpKvlc_Z8S"
            //     },
            //     include: {
            //         dataLayout: true
            //     }
            // }) || {}

            // let reducedNew = reduceTree(typedTree)

            // let reducedCurrent = reduceTree(currentTree || [])


            const newSet = mapTree(typedTree)
            // //Find new tree items
            // let newItems = reducedNew.filter((a: any) => {
            //     return reducedCurrent.map((y: any) => y.path).indexOf(a.path) < 0
            // })
            
            // //Find updated tree items
            // let updatedItems = reducedNew.filter((a: any) => {
            //     let item = reducedCurrent.find((b: any) => a.path == b.path);
            //     if(!item) return false;

            //     return item.type !== a.type
            // })

            // //Find deleted tree items

            // let deletedItems = reducedCurrent.filter((a: any) => {
            //     return reducedNew.map((x: any) => x.path).indexOf(a.path) < 0
            // })

            // console.log({deletedItems, updatedItems, newItems});

            console.log({newSet})
            await this.client.device.update({
                where: {
                    id: "iftwUBXW0FBNpKvlc_Z8S"
                },
                data: {
                    dataLayout: newSet
                }
            })

            console.log({tree})
        })



    }
}