/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import mongoose from "mongoose";
import { Socket } from "socket.io-client";

import { AppStateCtx } from "@/pages/index";
import getSocket from "@/utils/socket";
import { MessageDocument } from "@/models/message.model";

import MessageHistory from "./MessageHistory";
import Messenger from "./Messenger";
import { PiUserBold, PiXBold } from "react-icons/pi";

const MessengerView = (): JSX.Element => {
    const { state, setState } = useContext(AppStateCtx);
    const [messages, setMessages] = useState<MessageDocument[]>([]);
    const [socket, setSocket] = useState<Socket | undefined>();

    useEffect(() => {
        if (!state.validToken && socket?.connected) socket.disconnect();
        if (state.validToken && (!socket || socket.disconnected)) setSocket(getSocket());
    }, [state.validToken]);

    // Get messages when a conversation is selected
    useEffect(() => {
        if (socket && state.convo) {
            socket.emit("joinRoom", state.convo.id, () => {});
            socket.on("roomMessage", newMessageHandler);
            return () => {
                socket.off("roomMessage", newMessageHandler);
                socket.emit("leaveRoom", state.convo?.id, () => {});
                setMessages([]);
            };
        }
    }, [state.convo, socket]);

    const newMessageHandler = (new_message_string: string) => {
        let message_doc = JSON.parse(new_message_string) as MessageDocument;
        message_doc.convo_id = new mongoose.Types.ObjectId(message_doc.convo_id);
        message_doc.sender_id = new mongoose.Types.ObjectId(message_doc.sender_id);
        message_doc.createdAt = new Date(message_doc.createdAt);
        message_doc.updatedAt = new Date(message_doc.updatedAt);
        setMessages((prev_message_docs) => [message_doc, ...prev_message_docs]);
    };

    const closeConvo = () => {
        setState({ convo: undefined });
    };

    return (
        <div
            data-testid="messenger_view"
            className="flex flex-col grow max-h-full min-h-full ml-3 rounded drop-shadow"
        >
            {state.convo && socket ? (
                <>
                    <RecipientGlance
                        display_name={`${state.convo.user.name.first} ${state.convo.user.name.last}`.toUpperCase()}
                        closeHandler={closeConvo}
                    />
                    <MessageHistory
                        sender_id={new mongoose.Types.ObjectId(state.convo.user.id)}
                        history={state.convo.messages}
                        messages={messages}
                    />
                    <Messenger
                        convo_id={new mongoose.Types.ObjectId(state.convo.id)}
                        socket={socket}
                    />
                </>
            ) : null}
        </div>
    );
};

const RecipientGlance = ({
    display_name,
    closeHandler,
}: {
    display_name: string;
    closeHandler: () => void;
}): JSX.Element => {
    return (
        <div className="flex flex-row p-3 items-center rounded-t shadow bg-slate-300 ">
            <PiUserBold className="w-10 h-10 p-1.5 mr-2 rounded-full shadow bg-white " />
            <div className="flex flex-col grow">
                <span className="text-sm">{display_name}</span>
                <span className="text-xs">{"Offline" /* TODO: status*/}</span>
            </div>
            <PiXBold
                className="w-10 h-10 p-2.5 rounded-full cursor-pointer"
                onClick={closeHandler}
            />
        </div>
    );
};

export default MessengerView;
