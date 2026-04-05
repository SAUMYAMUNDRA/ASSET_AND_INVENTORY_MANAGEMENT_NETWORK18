import express from 'express';
import dbConnection from './db/dbConnection.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';


import login_route from './routers/auth/login_route.js';
import register_route from './routers/auth/register_route.js'
import logout_route from './routers/auth/logout_route.js';
import verify_router from './routers/admin/auth/verify_route.js';
import getallusers_route from './routers/admin/users/getallusers_route.js';
import createuser_route from './routers/admin/users/createuser_route.js';
import deleteuser_route from './routers/admin/users/deleteuser_route.js';
import makeadmin_route from './routers/admin/users/makeadmin_route.js';
import makeuser_route from './routers/admin/users/makeuser_route.js';
import edituser_route from './routers/admin/users/edituser_route.js'
import createDisplayRoute from './routers/studiodisplays/createdisplays_route.js';
import getalldisplays_route from './routers/studiodisplays/getalldisplays_route.js';
import router from './routers/studiodisplays/additional_route.js';
import resetuserpass_route from './routers/users/resetpassword_route.js';
import deletedisplays_route from './routers/studiodisplays/deletedisplays_route.js';
import editdisplays_route from './routers/studiodisplays/editdisplays_route.js';
import currentuser_route from './routers/users/currentuser_route.js';
import createAssetInventoryRoute from './routers/assetinventory/create_assetinventory_route.js';
import getallinventories_route from './routers/assetinventory/getallinventory_route.js';
import deleteinventory_route from './routers/assetinventory/deleteinventory_route.js';
import editinventory_Route from './routers/assetinventory/edit_inventory_route.js';
import creategatepassRoute from './routers/assetinventory/gatepass/creategatepass_route.js';
import getGatePassRoute from './routers/assetinventory/gatepass/getgatepass_route.js';
import updategatepassstatusRoute from './routers/assetinventory/gatepass/updattegatepassstatus_route.js';
import gatePassRoute from './routers/assetinventory/getinventorygate_route.js';
import create_eventRoute from "./routers/eventreport/create_event_route.js"
import getAllEventsRoute from "./routers/eventreport/get_events_route.js"
import logoutuser_route from './routers/admin/users/logoutuser_route.js';
import createvendorRoute from './routers/assetinventory/vendor/create_vendor_route.js';
import channeleventRouter from "./routers/assetinventory/channel/createchannel_route.js"
import createshowRoute from "./routers/assetinventory/show/createshow.js"
import createspecialadminRoute from './routers/specialadmin/createspecialadmin_route.js';
import getadminRoute from './routers/specialadmin/getadmin_route.js';
import editspecialadminRoute from './routers/specialadmin/editspecialadmin_route.js';
import verifyspecialadminRoute from './routers/specialadmin/verify_route.js';
import editGatepassRoute from './routers/assetinventory/gatepass/editgatepass_route.js';
import getrbac_route from './routers/admin/rbac/get_rbac_route.js';
import create_eventreminderRoute from './routers/eventreminder/createeventreminder_route.js';
import cron_router from "./routers/cron/cronroute.js"


const app = express();

app.use(cors({
    origin: /http:\/\/localhost(:\d+)?/,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());



app.use('/api/users',resetuserpass_route);
app.use("/api/auth/",register_route);
app.use("/api/auth/",login_route);
app.use('/api/auth',logout_route);
app.use('/api/admin/auth',verify_router);
app.use('/api/admin/users',getallusers_route);
app.use('/api/admin/users',createuser_route);
app.use('/api/admin/users',deleteuser_route);
app.use('/api/admin/users',makeadmin_route);
app.use('/api/admin/users',makeuser_route);
app.use('/api/admin/users',edituser_route);
app.use('/api/studiodisplays',createDisplayRoute);
app.use('/api/studiodisplays',getalldisplays_route);
app.use('/api/studiodisplays',deletedisplays_route);
app.use('/api/studiodisplays',editdisplays_route);
app.use('/api/users',currentuser_route);
app.use('/api/assetinventory',createAssetInventoryRoute);
app.use('/api/assetinventory',getallinventories_route);
app.use('/api/assetinventory',deleteinventory_route);
app.use('/api/assetinventory',editinventory_Route);
app.use('/api/studiodisplays',router);
app.use('/api/assetinventory/gatepass',creategatepassRoute);
app.use('/api/assetinventory/gatepass',getGatePassRoute);
app.use('/api/assetinventory/gatepass',editGatepassRoute);
app.use('/api/assetinventory/gatepass',updategatepassstatusRoute);
app.use('/api/assetinventory/gatepass',gatePassRoute);
app.use('/api/eventreport', create_eventRoute);
app.use('/api/eventreport', getAllEventsRoute);
app.use('/api/admin/users',logoutuser_route)
app.use('/api/assetinventory/vendor',createvendorRoute)
app.use('/api/assetinventory/channel',channeleventRouter)
app.use('/api/assetinventory/showtype',createshowRoute)
app.use('/api/specialadmin',createspecialadminRoute)
app.use('/api/specialadmin',getadminRoute)
app.use('/api/specialadmin',editspecialadminRoute)
app.use('/api/specialadmin',verifyspecialadminRoute)
app.use('/api/admin/rbac/', getrbac_route)
app.use("/api/eventreminder",create_eventreminderRoute);
app.use('/api/cron',cron_router);







const startServer = async () => {
    try {
        
        const conn = await dbConnection.getConnection();
        conn.release();
        console.log('✅ Database verified. Starting server...');

        const PORT = process.env.PORT || 4000;
        app.listen(PORT, () => {
            console.log(`✅ Server started on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Cannot start server: Database connection failed');
        console.error(error);
        process.exit(1);
    }
};
startServer()
