--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2024-06-19 13:32:49 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 28044)
-- Name: token_blacklist; Type: TABLE; Schema: public; Owner: guest_1
--

CREATE TABLE public.token_blacklist (
    id integer NOT NULL,
    jwt_token character varying(255) NOT NULL
);


ALTER TABLE public.token_blacklist OWNER TO guest_1;

--
-- TOC entry 221 (class 1259 OID 28043)
-- Name: token_blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: guest_1
--

CREATE SEQUENCE public.token_blacklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.token_blacklist_id_seq OWNER TO guest_1;

--
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 221
-- Name: token_blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: guest_1
--

ALTER SEQUENCE public.token_blacklist_id_seq OWNED BY public.token_blacklist.id;


--
-- TOC entry 220 (class 1259 OID 28024)
-- Name: user_requests; Type: TABLE; Schema: public; Owner: guest_1
--

CREATE TABLE public.user_requests (
    id integer NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    message text NOT NULL,
    comment text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    created_by integer NOT NULL,
    resolved_by integer
);


ALTER TABLE public.user_requests OWNER TO guest_1;

--
-- TOC entry 219 (class 1259 OID 28023)
-- Name: user_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: guest_1
--

CREATE SEQUENCE public.user_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_requests_id_seq OWNER TO guest_1;

--
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: guest_1
--

ALTER SEQUENCE public.user_requests_id_seq OWNED BY public.user_requests.id;


--
-- TOC entry 216 (class 1259 OID 27996)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: guest_1
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    role character varying(255) DEFAULT 'user'::character varying NOT NULL
);


ALTER TABLE public.user_roles OWNER TO guest_1;

--
-- TOC entry 215 (class 1259 OID 27995)
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: guest_1
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO guest_1;

--
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 215
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: guest_1
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- TOC entry 218 (class 1259 OID 28006)
-- Name: users; Type: TABLE; Schema: public; Owner: guest_1
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    avatar character varying(255),
    password character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    user_role_id integer NOT NULL
);


ALTER TABLE public.users OWNER TO guest_1;

--
-- TOC entry 217 (class 1259 OID 28005)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: guest_1
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO guest_1;

--
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: guest_1
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3463 (class 2604 OID 28047)
-- Name: token_blacklist id; Type: DEFAULT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.token_blacklist ALTER COLUMN id SET DEFAULT nextval('public.token_blacklist_id_seq'::regclass);


--
-- TOC entry 3461 (class 2604 OID 28027)
-- Name: user_requests id; Type: DEFAULT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_requests ALTER COLUMN id SET DEFAULT nextval('public.user_requests_id_seq'::regclass);


--
-- TOC entry 3458 (class 2604 OID 27999)
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- TOC entry 3460 (class 2604 OID 28009)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3633 (class 0 OID 28044)
-- Dependencies: 222
-- Data for Name: token_blacklist; Type: TABLE DATA; Schema: public; Owner: guest_1
--

COPY public.token_blacklist (id, jwt_token) FROM stdin;
1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE4OTAyLCJleHAiOjE3MTg4OTE3MDJ9.hJV6zfvvM1p1DH5J9MKo49f7uAmdT314-ZYfA_tnpE4
2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE4OTExLCJleHAiOjE3MTg4OTE3MTF9.ZfyaGKbkb8EuNT6LOo_7g9quJsHqFo2qYklrymHkDKc
3	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE4OTE2LCJleHAiOjE3MTg4OTE3MTZ9.L7OeMTFkgJzPr6Mb7_PjXpz_zzsfC7ncJYpxcCX0K8s
4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE4OTE3LCJleHAiOjE3MTg4OTE3MTd9.AJWMaU8b97_FIuMrcc3X8OPY8WhChAWYk6R2dwTgZG0
5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE4OTk3LCJleHAiOjE3MTg4OTE3OTd9.YnGHE5gtUYV07msnXBKutzOsp59ZIVQ1Yvk2_LhrxEk
6	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE5MDAzLCJleHAiOjE3MTg4OTE4MDN9.RshY2ckhOBEgJ5PIt9kgl3x64hrU6kJNYQcqUsMG3y8
7	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE5MDE2LCJleHAiOjE3MTg4OTE4MTZ9.2L3D8V86LyecMx6mo4b_pTOlYDCy3Dyl3UCkkPTkqlo
8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlVzZXIxMDAwIiwiZW1haWwiOiJ1c2VyMTIzQGV4YW1wbGUuY29tIiwicm9sZSI6MSwiaWF0IjoxNzE4NzE5NzQ5LCJleHAiOjE3MTg4OTI1NDl9.M5SrgJbfQSJKgNWkyQssed3KcopJbrckAFkjzLp7hAM
\.


--
-- TOC entry 3631 (class 0 OID 28024)
-- Dependencies: 220
-- Data for Name: user_requests; Type: TABLE DATA; Schema: public; Owner: guest_1
--

COPY public.user_requests (id, status, message, comment, created_at, updated_at, created_by, resolved_by) FROM stdin;
3	active	Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis eos delectus numquam aperiam hic reiciendis exercitationem voluptatum doloremque dolores incidunt? Perspiciatis accusamus quaerat corrupti fugit, voluptas harum esse maiores magnam.	\N	2024-06-18 20:39:25.115+03	\N	1	\N
4	active	Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex natus beatae earum nisi est maxime debitis labore repudiandae animi libero veritatis, laboriosam officiis quod, ipsa ea fugit voluptas! Rerum, nam?	\N	2024-06-18 20:39:42.125+03	\N	1	\N
5	resolved	Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus ad quia ullam sequi tenetur hic laboriosam, natus officia. Adipisci quia molestiae officiis sapiente magni saepe quidem. Fugit cumque ducimus corrupti?	Admin's resolution comment.	2024-06-18 20:39:57.995+03	2024-06-19 00:14:50.084+03	1	2
\.


--
-- TOC entry 3627 (class 0 OID 27996)
-- Dependencies: 216
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: guest_1
--

COPY public.user_roles (id, role) FROM stdin;
1	user
2	admin
\.


--
-- TOC entry 3629 (class 0 OID 28006)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: guest_1
--

COPY public.users (id, username, email, first_name, last_name, avatar, password, created_at, user_role_id) FROM stdin;
1	User1000	user123@example.com	UserFirst	UserLast	/Users/macbookpro/IT/GitHub_projects/RequestsHandler/api/assets/uploads/avatars/avatar_4bb64.png	$2a$10$kpL9Ngxg5C6fOnPNVYQvaeFq8dbBTQf9NiRs0YUAsOtWuGVlBc606	2024-06-18 16:22:36.567+03	1
2	Admin	admin123@example.com	AdminFirst	AdminLast	\N	$2a$10$fCyL9p/7cpsrz.QIpduCW.Hr64YJnf7egz8waXek4WIw3fKra7t3S	2024-06-18 17:37:55.502+03	2
\.


--
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 221
-- Name: token_blacklist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: guest_1
--

SELECT pg_catalog.setval('public.token_blacklist_id_seq', 8, true);


--
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 219
-- Name: user_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: guest_1
--

SELECT pg_catalog.setval('public.user_requests_id_seq', 5, true);


--
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 215
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: guest_1
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 2, true);


--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: guest_1
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 3477 (class 2606 OID 28051)
-- Name: token_blacklist token_blacklist_jwt_token_key; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.token_blacklist
    ADD CONSTRAINT token_blacklist_jwt_token_key UNIQUE (jwt_token);


--
-- TOC entry 3479 (class 2606 OID 28049)
-- Name: token_blacklist token_blacklist_pkey; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.token_blacklist
    ADD CONSTRAINT token_blacklist_pkey PRIMARY KEY (id);


--
-- TOC entry 3475 (class 2606 OID 28032)
-- Name: user_requests user_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_requests
    ADD CONSTRAINT user_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3465 (class 2606 OID 28002)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3467 (class 2606 OID 28004)
-- Name: user_roles user_roles_role_key; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_key UNIQUE (role);


--
-- TOC entry 3469 (class 2606 OID 28017)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3471 (class 2606 OID 28013)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3473 (class 2606 OID 28015)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3481 (class 2606 OID 28033)
-- Name: user_requests user_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_requests
    ADD CONSTRAINT user_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3482 (class 2606 OID 28038)
-- Name: user_requests user_requests_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.user_requests
    ADD CONSTRAINT user_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3480 (class 2606 OID 28018)
-- Name: users users_user_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: guest_1
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_role_id_fkey FOREIGN KEY (user_role_id) REFERENCES public.user_roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO guest_1;


-- Completed on 2024-06-19 13:32:49 MSK

--
-- PostgreSQL database dump complete
--

