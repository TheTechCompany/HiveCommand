import { Box, Typography, Divider, List, ListItem, Popover,  Paper, IconButton } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight, Home, Fullscreen, FullscreenExit } from '@mui/icons-material'
import React, { useEffect, useState } from 'react'
import Toolbar from '../../toolbar'
import { AvatarList } from '@hexhive/ui'

export interface HeaderProps {
    menuItems?: {
        id: string,
        label: string,
        icon: any,
        active: boolean,
        onClick?: () => void;
    }[]

    title?: string;

    activeUsers?: {
        id: string;
        name: string;
    }[]

    fullscreenHandler?: () => void;
}

export const Header: React.FC<HeaderProps> = (props) => {

    const [ avatarAnchor, setAvatarAnchor ] = useState<any>(null);

    const [ isFullScreen, setFullScreen ] = useState(false);

    useEffect(() => {
        let fullscreenChanged = () => {
            if(document.fullscreenElement){
                setFullScreen(true)
            }else{
                setFullScreen(false)
            }
        }

        document.addEventListener('fullscreenchange', fullscreenChanged)

        return () => {
            document.removeEventListener('fullscreenchange', fullscreenChanged)
        }

    }, [])
    return (
        <Paper
            elevation={6}
            sx={{
                borderRadius: 0,
                bgcolor: 'secondary.main',
                padding: '3px',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                display: 'flex'
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    size="small"
                    // onClick={() => navigate("../../")}
                    sx={{ color: 'navigation.main' }}>
                    <KeyboardArrowLeft
                        fontSize="inherit"

                    />
                </IconButton>
                <IconButton
                    size="small"
                    sx={{ color: 'navigation.main' }}>
                    <Home
                        fontSize="inherit"

                    />
                </IconButton>
                <IconButton
                    size="small"
                    sx={{ color: 'navigation.main' }}>
                    <KeyboardArrowRight
                        fontSize="inherit"
                    />
                </IconButton>



            </Box>
            <Box sx={{ display: 'flex', flex: 1, flexDirection: "row", justifyContent: 'center', alignItems: "center" }}>
                <Box
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: 7,
                        marginRight: '8px',
                        marginLeft: '8px',
                        // background: rootDevice?.online ? '#42e239' : '#db001b'
                    }} />
                <Typography color="#fff">{props.title}</Typography>
            </Box>

            <Toolbar
                // active={toolbar_menu.find((a) => matchPath(window.location.pathname, `${a?.id}`) != null)?.id}
                onItemClick={(item) => {

                    props.menuItems?.find((a) => a.id == item)?.onClick?.();

                    // switch (item) {
                    //     case 'maintain':
                    //         setMaintenanceWindow(true)
                    //         break;
                    //     case 'time-machine':
                    //         setHistorize(!historize);
                    //         break;
                    //     case 'alarms':
                    //         if (window.location.href.indexOf('alarms') > -1) {
                    //             navigate('.')
                    //         } else {
                    //             navigate('alarms');
                    //         }

                    //         break;
                    // }
                    // navigate(`${item}`)
                }}
                items={props.menuItems} />

            <IconButton onClick={props.fullscreenHandler}>
                {isFullScreen ? <FullscreenExit sx={{color: "white"}} /> : <Fullscreen sx={{color: "white"}}/>}
            </IconButton>
            <Box
                sx={{ marginLeft: '6px' }}
                onMouseEnter={(evt) => {
                    setAvatarAnchor(evt.currentTarget)
                }}
                onMouseLeave={(evt) => {
                    setAvatarAnchor(null)
                }}>
                <AvatarList
                    users={(props.activeUsers || []).map((x: any) => ({
                        ...x,
                        // color: stringToColor(x.name)
                    })) || []} />

                <Popover
                    open={Boolean(avatarAnchor)}
                    anchorEl={avatarAnchor}
                    transformOrigin={{
                        horizontal: 'center',
                        vertical: 'top'
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}

                    sx={{
                        pointerEvents: 'none',
                    }}
                >
                    <Box sx={{ padding: '6px', display: 'flex', flexDirection: 'column' }}>
                        <Typography>Observing</Typography>
                        <Divider />
                        <List disablePadding>
                            {props.activeUsers?.map((x: any) => (
                                <ListItem sx={{ marginBottom: '3px' }} dense>{x.name}</ListItem>
                            ))}
                        </List>
                    </Box>
                </Popover>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: "row" }}>
                {/* {view?.id == 'controls' && (<IconButton><Cycle /></IconButton>)} */}
            </Box>
        </Paper>
    )
}