import express from 'express';

interface pagination {
    page: string;
    pageSize: string;
    q: string
}

namespace ExpressNS {
    export interface RequestWithUser extends express.Request {
        user?: User;
    }
}
