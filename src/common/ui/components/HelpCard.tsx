import React from 'react';
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/common/ui/atoms/card";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { openWindow } from "@/lib/utils/navigation";
import { Button } from '@/common/ui/atoms/button';

const HelpCard = () => (
    <Card>
        <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Need help?</CardTitle>
            <CardDescription>
                Did anything break? Need support? Want to chat about Farcaster apps?
            </CardDescription>
        </CardHeader>
        <CardContent className="grid">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Button variant="default" onClick={() => openWindow('https://warpcast.com/hellno')}>
                    <ChatBubbleLeftEllipsisIcon className="mr-2 h-4 w-4" />
                    Talk to me on Warpcast
                </Button>
                <Button variant="outline" onClick={() => openWindow('https://t.me/HELLNO_HELLNO')}>
                    <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                    Talk to me on Telegram
                </Button>
            </div>
        </CardContent>
    </Card>
);

export default HelpCard;
