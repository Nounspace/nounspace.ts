import React from "react";
import Space from "@/common/ui/templates/space";
import { useAccountStore } from "@/common/data/stores/useAccountStore";

function retrieveConfig(user, space){
    const fidgetConfigs = {};
    const layoutConfig = {}
    const layoutID = "";

    return ({fidgetConfigs, layoutConfig, layoutID})
}

export default function Homebase(spaceID) {

   //const { getCurrentUser } = useAccountStore();
    const user = useAccountStore.getState().accounts[0];

    return (
        <Space config={retrieveConfig(user, spaceID)} isEditable={true}></Space>
    )
}