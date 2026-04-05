import express from "express";
import { isAdmin } from "../../../middlewares/isadmin.js"
import * as eventchannel from "../../../models/channelevent_model.js"
import { isLoggedIn } from "../../../middlewares/isloggedin.js";
import { isAuthorized } from "../../../middlewares/isAuthorized.js";

const channeleventRouter=express.Router();

channeleventRouter.post('/create-channel',isLoggedIn,isAuthorized(28), async (req,res)=>{
    try {
      const city_id=req.user.city_id;
        const  { channelName,channelType }=req.body;
        if(!channelName || !channelType){
              return res.status(400).send({ error: "Channel Name and Type are required" });
        }
        const channel_name=channelName
        const channel_type=channelType
        console.log("channel type is",channel_type);
        
        const duplicates = await eventchannel.getEventChannelByName(channel_name);

if (duplicates.length > 0) {
  console.log("Duplicate found:", duplicates);
  return res.status(400).send({ error: "Channel Name already exist in database" });
}
        
        await eventchannel.createEventChannel(channel_name,city_id,channel_type);
        
        return res.status(201).send({ message: "Channel  created"});

    } catch (error) {
         console.error("creating Channel error:", error);
        return res.status(500).send({ error: "Error creating channel" });
    }
})
channeleventRouter.get('/get-channels',isLoggedIn,isAuthorized(29),async (req,res)=>{
      try {
              const city_id=req.user.city_id;

        const channels = await eventchannel.getAllEventChannels(city_id);
        return res.status(200).send(channels);
      } catch (error) {
        console.error("fetch channel error:", error);
        return res.status(500).send({ error: "Error fetching channels" });
      }

})
channeleventRouter.delete('/delete-channel/:id',isLoggedIn,isAuthorized(30),async (req,res)=>{
      try {
        const {id}=req.params;

        await eventchannel.deleteEventChannel(id);

        return res.status(200).send({ message: "Channel deleted successfully" });
      } catch (error) {
        console.error("deleting channel error:", error);
        return res.status(500).send({ error: "Error deleting channel" });
      }

})

export default channeleventRouter;
