--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2026-03-30 11:36:14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 907 (class 1247 OID 31598)
-- Name: connectionstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.connectionstatus AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'BLOCKED'
);


ALTER TYPE public.connectionstatus OWNER TO postgres;

--
-- TOC entry 901 (class 1247 OID 31574)
-- Name: niveaucompetences; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.niveaucompetences AS ENUM (
    'DEBUTANT',
    'INTERMEDIAIRE',
    'AVANCE',
    'EXPERT'
);


ALTER TYPE public.niveaucompetences OWNER TO postgres;

--
-- TOC entry 904 (class 1247 OID 31584)
-- Name: niveaulangue; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.niveaulangue AS ENUM (
    'A1',
    'A2',
    'B1',
    'B2',
    'C1',
    'C2'
);


ALTER TYPE public.niveaulangue OWNER TO postgres;

--
-- TOC entry 910 (class 1247 OID 31608)
-- Name: reactiontype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reactiontype AS ENUM (
    'LIKE',
    'LOVE',
    'FUNNY',
    'ANGRY',
    'SAD',
    'DISLIKE'
);


ALTER TYPE public.reactiontype OWNER TO postgres;

--
-- TOC entry 898 (class 1247 OID 31567)
-- Name: usertype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.usertype AS ENUM (
    'ENSEIGNANT',
    'DOCTORANT',
    'ADMIN'
);


ALTER TYPE public.usertype OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 242 (class 1259 OID 31853)
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    "user1Id" integer NOT NULL,
    "user2Id" integer NOT NULL
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 31852)
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 241
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- TOC entry 262 (class 1259 OID 32016)
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone,
    "postId" integer NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 32015)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 261
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 254 (class 1259 OID 31951)
-- Name: competences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.competences (
    id integer NOT NULL,
    nom character varying NOT NULL,
    niveau public.niveaucompetences NOT NULL,
    "cvId" integer NOT NULL
);


ALTER TABLE public.competences OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 31950)
-- Name: competences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.competences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.competences_id_seq OWNER TO postgres;

--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 253
-- Name: competences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.competences_id_seq OWNED BY public.competences.id;


--
-- TOC entry 244 (class 1259 OID 31871)
-- Name: connections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.connections (
    id integer NOT NULL,
    status public.connectionstatus NOT NULL,
    "timestamp" timestamp without time zone,
    "acceptedAt" timestamp without time zone,
    "senderId" integer NOT NULL,
    "receiverId" integer NOT NULL
);


ALTER TABLE public.connections OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 31870)
-- Name: connections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.connections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.connections_id_seq OWNER TO postgres;

--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 243
-- Name: connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.connections_id_seq OWNED BY public.connections.id;


--
-- TOC entry 250 (class 1259 OID 31919)
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    email character varying NOT NULL,
    telephone character varying,
    adresse character varying,
    "cvId" integer NOT NULL
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 31918)
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO postgres;

--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 249
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- TOC entry 240 (class 1259 OID 31836)
-- Name: cvs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cvs (
    id integer NOT NULL,
    titre character varying NOT NULL,
    description text,
    "dateCreation" date NOT NULL,
    "dateModification" date,
    "isPublic" boolean,
    "userId" integer NOT NULL,
    cv_enabled boolean DEFAULT true
);


ALTER TABLE public.cvs OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 31835)
-- Name: cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cvs_id_seq OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 239
-- Name: cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cvs_id_seq OWNED BY public.cvs.id;


--
-- TOC entry 230 (class 1259 OID 31709)
-- Name: departements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departements (
    id integer NOT NULL,
    nom character varying NOT NULL,
    description text,
    "etablissementId" integer
);


ALTER TABLE public.departements OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 31708)
-- Name: departements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departements_id_seq OWNER TO postgres;

--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 229
-- Name: departements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departements_id_seq OWNED BY public.departements.id;


--
-- TOC entry 228 (class 1259 OID 31692)
-- Name: equipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipes (
    id integer NOT NULL,
    nom character varying NOT NULL,
    description text,
    "universityId" integer
);


ALTER TABLE public.equipes OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 31691)
-- Name: equipes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipes_id_seq OWNER TO postgres;

--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 227
-- Name: equipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipes_id_seq OWNED BY public.equipes.id;


--
-- TOC entry 224 (class 1259 OID 31658)
-- Name: etablissements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etablissements (
    id integer NOT NULL,
    nom character varying NOT NULL,
    adresse character varying,
    ville character varying,
    pays character varying,
    "Logo" character varying,
    "universityId" integer
);


ALTER TABLE public.etablissements OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 31657)
-- Name: etablissements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etablissements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etablissements_id_seq OWNER TO postgres;

--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 223
-- Name: etablissements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etablissements_id_seq OWNED BY public.etablissements.id;


--
-- TOC entry 258 (class 1259 OID 31981)
-- Name: experiences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.experiences (
    id integer NOT NULL,
    poste character varying NOT NULL,
    entreprise character varying,
    description text,
    "dateDebut" date NOT NULL,
    "dateFin" date,
    "enCours" boolean,
    "cvId" integer NOT NULL
);


ALTER TABLE public.experiences OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 31980)
-- Name: experiences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.experiences_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.experiences_id_seq OWNER TO postgres;

--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 257
-- Name: experiences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.experiences_id_seq OWNED BY public.experiences.id;


--
-- TOC entry 252 (class 1259 OID 31936)
-- Name: formations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formations (
    id integer NOT NULL,
    diplome character varying NOT NULL,
    etablissement character varying,
    "dateDebut" date NOT NULL,
    "dateFin" date,
    "enCours" boolean,
    "cvId" integer NOT NULL
);


ALTER TABLE public.formations OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 31935)
-- Name: formations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formations_id_seq OWNER TO postgres;

--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 251
-- Name: formations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formations_id_seq OWNED BY public.formations.id;


--
-- TOC entry 238 (class 1259 OID 31817)
-- Name: google_scholar_integrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.google_scholar_integrations (
    id integer NOT NULL,
    "googleScholarId" character varying NOT NULL,
    "profileUrl" character varying,
    "lastSynced" date,
    "userId" integer NOT NULL
);


ALTER TABLE public.google_scholar_integrations OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 31816)
-- Name: google_scholar_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.google_scholar_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_scholar_integrations_id_seq OWNER TO postgres;

--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 237
-- Name: google_scholar_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.google_scholar_integrations_id_seq OWNED BY public.google_scholar_integrations.id;


--
-- TOC entry 265 (class 1259 OID 32070)
-- Name: group_chat_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.group_chat_members (
    chat_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.group_chat_members OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 31675)
-- Name: laboratoires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.laboratoires (
    id integer NOT NULL,
    nom character varying NOT NULL,
    description text,
    "universityId" integer
);


ALTER TABLE public.laboratoires OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 31674)
-- Name: laboratoires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.laboratoires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.laboratoires_id_seq OWNER TO postgres;

--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 225
-- Name: laboratoires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.laboratoires_id_seq OWNED BY public.laboratoires.id;


--
-- TOC entry 256 (class 1259 OID 31966)
-- Name: langues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.langues (
    id integer NOT NULL,
    nom character varying NOT NULL,
    niveau public.niveaulangue NOT NULL,
    "cvId" integer NOT NULL
);


ALTER TABLE public.langues OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 31965)
-- Name: langues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.langues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.langues_id_seq OWNER TO postgres;

--
-- TOC entry 5181 (class 0 OID 0)
-- Dependencies: 255
-- Name: langues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.langues_id_seq OWNED BY public.langues.id;


--
-- TOC entry 260 (class 1259 OID 31996)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone,
    "chatId" integer NOT NULL,
    "senderId" integer NOT NULL,
    attachment text,
    is_read integer DEFAULT 0
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 31995)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 5182 (class 0 OID 0)
-- Dependencies: 259
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 246 (class 1259 OID 31889)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone,
    attachement character varying,
    "isPublic" boolean,
    "userId" integer NOT NULL,
    "publicationId" integer,
    "scopusPublicationId" integer
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 31888)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO postgres;

--
-- TOC entry 5183 (class 0 OID 0)
-- Dependencies: 245
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 236 (class 1259 OID 31802)
-- Name: projets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projets (
    id integer NOT NULL,
    titre character varying NOT NULL,
    description text NOT NULL,
    budget double precision NOT NULL,
    "dateDebut" date NOT NULL,
    "dureeEnMois" integer NOT NULL,
    statut character varying NOT NULL,
    "userId" integer NOT NULL
);


ALTER TABLE public.projets OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 31801)
-- Name: projets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.projets_id_seq OWNER TO postgres;

--
-- TOC entry 5184 (class 0 OID 0)
-- Dependencies: 235
-- Name: projets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projets_id_seq OWNED BY public.projets.id;


--
-- TOC entry 248 (class 1259 OID 31904)
-- Name: publications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.publications (
    id integer NOT NULL,
    title character varying NOT NULL,
    abstract text,
    summary text,
    "publicationDate" date,
    "citationCount" integer,
    "googleScholarUrl" character varying,
    "isPosted" boolean,
    "googleScholarIntegrationId" integer NOT NULL
);


ALTER TABLE public.publications OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 31903)
-- Name: publications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.publications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.publications_id_seq OWNER TO postgres;

--
-- TOC entry 5185 (class 0 OID 0)
-- Dependencies: 247
-- Name: publications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.publications_id_seq OWNED BY public.publications.id;


--
-- TOC entry 264 (class 1259 OID 32036)
-- Name: reactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reactions (
    id integer NOT NULL,
    type public.reactiontype NOT NULL,
    "timestamp" timestamp without time zone,
    "postId" integer,
    "userId" integer NOT NULL,
    "commentId" integer
);


ALTER TABLE public.reactions OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 32035)
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reactions_id_seq OWNER TO postgres;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 263
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- TOC entry 267 (class 1259 OID 32087)
-- Name: scopus_integrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scopus_integrations (
    id integer NOT NULL,
    "scopusAuthorId" character varying NOT NULL,
    "profileUrl" character varying,
    "lastSynced" date,
    "userId" integer NOT NULL
);


ALTER TABLE public.scopus_integrations OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 32086)
-- Name: scopus_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scopus_integrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scopus_integrations_id_seq OWNER TO postgres;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 266
-- Name: scopus_integrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scopus_integrations_id_seq OWNED BY public.scopus_integrations.id;


--
-- TOC entry 269 (class 1259 OID 32105)
-- Name: scopus_publications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scopus_publications (
    id integer NOT NULL,
    title character varying NOT NULL,
    abstract text,
    summary character varying(1000),
    "publicationDate" date,
    "citationCount" integer,
    "scopusUrl" character varying,
    "isPosted" boolean,
    "scopusIntegrationId" integer NOT NULL
);


ALTER TABLE public.scopus_publications OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 32104)
-- Name: scopus_publications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scopus_publications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scopus_publications_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 268
-- Name: scopus_publications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scopus_publications_id_seq OWNED BY public.scopus_publications.id;


--
-- TOC entry 220 (class 1259 OID 31634)
-- Name: specialites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specialites (
    id integer NOT NULL,
    nom character varying NOT NULL,
    description text
);


ALTER TABLE public.specialites OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 31633)
-- Name: specialites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.specialites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.specialites_id_seq OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 219
-- Name: specialites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.specialites_id_seq OWNED BY public.specialites.id;


--
-- TOC entry 222 (class 1259 OID 31646)
-- Name: thematiques_de_recherche; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thematiques_de_recherche (
    id integer NOT NULL,
    nom character varying NOT NULL,
    description text
);


ALTER TABLE public.thematiques_de_recherche OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 31645)
-- Name: thematiques_de_recherche_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.thematiques_de_recherche_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thematiques_de_recherche_id_seq OWNER TO postgres;

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 221
-- Name: thematiques_de_recherche_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.thematiques_de_recherche_id_seq OWNED BY public.thematiques_de_recherche.id;


--
-- TOC entry 218 (class 1259 OID 31622)
-- Name: universities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.universities (
    id integer NOT NULL,
    nom character varying NOT NULL,
    adresse character varying,
    ville character varying,
    pays character varying,
    "Logo" character varying
);


ALTER TABLE public.universities OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 31621)
-- Name: universities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.universities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.universities_id_seq OWNER TO postgres;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 217
-- Name: universities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.universities_id_seq OWNED BY public.universities.id;


--
-- TOC entry 234 (class 1259 OID 31786)
-- Name: user_specialite_association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_specialite_association (
    "userId" integer NOT NULL,
    "specialiteId" integer NOT NULL
);


ALTER TABLE public.user_specialite_association OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 31771)
-- Name: user_thematique_association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_thematique_association (
    "userId" integer NOT NULL,
    "thematiqueId" integer NOT NULL
);


ALTER TABLE public.user_thematique_association OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 31726)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    "fullName" character varying NOT NULL,
    password character varying NOT NULL,
    email character varying NOT NULL,
    user_type public.usertype,
    profile_completed boolean,
    otp_configured boolean,
    otp_secret character varying,
    nom character varying,
    prenom character varying,
    grade character varying,
    "dateDeNaissance" date,
    "photoDeProfil" character varying,
    "numeroDeSomme" character varying,
    "universityId" integer,
    "etablissementId" integer,
    "departementId" integer,
    "laboratoireId" integer,
    "equipeId" integer,
    "specialiteId" integer,
    "thematiqueDeRechercheId" integer,
    email_verified boolean DEFAULT false,
    email_verification_token character varying(255),
    email_verification_token_expiry character varying(255)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 31725)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4801 (class 2604 OID 31856)
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- TOC entry 4812 (class 2604 OID 32019)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 31954)
-- Name: competences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competences ALTER COLUMN id SET DEFAULT nextval('public.competences_id_seq'::regclass);


--
-- TOC entry 4802 (class 2604 OID 31874)
-- Name: connections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections ALTER COLUMN id SET DEFAULT nextval('public.connections_id_seq'::regclass);


--
-- TOC entry 4805 (class 2604 OID 31922)
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 31839)
-- Name: cvs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs ALTER COLUMN id SET DEFAULT nextval('public.cvs_id_seq'::regclass);


--
-- TOC entry 4794 (class 2604 OID 31712)
-- Name: departements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departements ALTER COLUMN id SET DEFAULT nextval('public.departements_id_seq'::regclass);


--
-- TOC entry 4793 (class 2604 OID 31695)
-- Name: equipes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes ALTER COLUMN id SET DEFAULT nextval('public.equipes_id_seq'::regclass);


--
-- TOC entry 4791 (class 2604 OID 31661)
-- Name: etablissements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etablissements ALTER COLUMN id SET DEFAULT nextval('public.etablissements_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 31984)
-- Name: experiences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences ALTER COLUMN id SET DEFAULT nextval('public.experiences_id_seq'::regclass);


--
-- TOC entry 4806 (class 2604 OID 31939)
-- Name: formations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations ALTER COLUMN id SET DEFAULT nextval('public.formations_id_seq'::regclass);


--
-- TOC entry 4798 (class 2604 OID 31820)
-- Name: google_scholar_integrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_scholar_integrations ALTER COLUMN id SET DEFAULT nextval('public.google_scholar_integrations_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 31678)
-- Name: laboratoires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratoires ALTER COLUMN id SET DEFAULT nextval('public.laboratoires_id_seq'::regclass);


--
-- TOC entry 4808 (class 2604 OID 31969)
-- Name: langues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.langues ALTER COLUMN id SET DEFAULT nextval('public.langues_id_seq'::regclass);


--
-- TOC entry 4810 (class 2604 OID 31999)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4803 (class 2604 OID 31892)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 31805)
-- Name: projets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projets ALTER COLUMN id SET DEFAULT nextval('public.projets_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 31907)
-- Name: publications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publications ALTER COLUMN id SET DEFAULT nextval('public.publications_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 32039)
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 32090)
-- Name: scopus_integrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_integrations ALTER COLUMN id SET DEFAULT nextval('public.scopus_integrations_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 32108)
-- Name: scopus_publications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_publications ALTER COLUMN id SET DEFAULT nextval('public.scopus_publications_id_seq'::regclass);


--
-- TOC entry 4789 (class 2604 OID 31637)
-- Name: specialites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialites ALTER COLUMN id SET DEFAULT nextval('public.specialites_id_seq'::regclass);


--
-- TOC entry 4790 (class 2604 OID 31649)
-- Name: thematiques_de_recherche id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thematiques_de_recherche ALTER COLUMN id SET DEFAULT nextval('public.thematiques_de_recherche_id_seq'::regclass);


--
-- TOC entry 4788 (class 2604 OID 31625)
-- Name: universities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.universities ALTER COLUMN id SET DEFAULT nextval('public.universities_id_seq'::regclass);


--
-- TOC entry 4795 (class 2604 OID 31729)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5135 (class 0 OID 31853)
-- Dependencies: 242
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, "user1Id", "user2Id") FROM stdin;
13	5	8
14	2	5
\.


--
-- TOC entry 5155 (class 0 OID 32016)
-- Dependencies: 262
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, content, "timestamp", "postId", "userId") FROM stdin;
15	nice	2026-03-05 22:31:25.679929	15	5
16	test	2026-03-05 22:35:06.181448	15	5
17	good work	2026-03-05 22:57:37.869864	20	5
18	test	2026-03-05 23:16:18.765911	21	4
19	yyy	2026-03-05 23:20:26.636913	21	4
20	wq	2026-03-05 23:20:40.95215	21	4
21	esq	2026-03-05 23:29:57.004838	21	4
22	test	2026-03-06 01:03:07.858286	15	5
\.


--
-- TOC entry 5147 (class 0 OID 31951)
-- Dependencies: 254
-- Data for Name: competences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.competences (id, nom, niveau, "cvId") FROM stdin;
1	Python	AVANCE	1
2	java	INTERMEDIAIRE	1
3	docker	DEBUTANT	1
4	Python	AVANCE	4
5	FastAPI	AVANCE	4
6	Docker	INTERMEDIAIRE	4
7	Nmap	DEBUTANT	4
\.


--
-- TOC entry 5137 (class 0 OID 31871)
-- Dependencies: 244
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.connections (id, status, "timestamp", "acceptedAt", "senderId", "receiverId") FROM stdin;
1	ACCEPTED	2025-11-19 15:51:22.91815	2025-11-19 15:56:04.953262	4	2
2	ACCEPTED	2026-02-02 20:00:14.707059	2026-02-02 21:13:00.465925	5	2
6	REJECTED	2026-02-03 09:17:28.476106	\N	4	6
5	REJECTED	2026-02-03 09:17:15.212267	\N	4	5
9	REJECTED	2026-02-03 17:02:16.090808	\N	5	6
38	ACCEPTED	2026-02-10 23:43:03.23191	2026-02-10 23:43:59.555058	8	5
39	ACCEPTED	2026-02-10 23:43:04.170577	2026-03-05 22:58:12.716614	8	4
40	REJECTED	2026-03-06 00:14:36.146313	\N	5	4
45	ACCEPTED	2026-03-25 14:50:39.585533	2026-03-25 14:51:01.001284	4	5
4	REJECTED	2026-02-03 09:06:42.098883	\N	6	2
22	REJECTED	2026-02-05 00:49:45.056254	\N	4	6
23	REJECTED	2026-02-05 01:32:51.17182	\N	4	6
24	ACCEPTED	2026-02-05 01:48:19.258461	2026-02-05 01:50:34.205233	4	6
\.


--
-- TOC entry 5143 (class 0 OID 31919)
-- Dependencies: 250
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, email, telephone, adresse, "cvId") FROM stdin;
1	doctoran1@example.com	0625114303	NR 215 Quartier Kaf El Mal Sefrou	1
3	abdellahafroukh9@gmail.com	0625114303	NR 215 Quartier Kaf El Mal Sefrou	4
\.


--
-- TOC entry 5133 (class 0 OID 31836)
-- Dependencies: 240
-- Data for Name: cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cvs (id, titre, description, "dateCreation", "dateModification", "isPublic", "userId", cv_enabled) FROM stdin;
3	Abdellah Afroukh	cv for ddwdnkndaikda	2026-02-04	2026-02-04	f	5	f
1	Test user	test cv	2025-11-18	2026-02-09	f	4	t
4	PFE Internship	Master’s student in IT Security and Big Data, seeking an end-of-studies internship (PFE) in cybersecurity-related fields. Passionate about web development and emerging technologies, I combine technical skills and creativity to tackle complex challenges in IT security and data analysis.	2026-02-10	2026-02-11	t	8	f
\.


--
-- TOC entry 5123 (class 0 OID 31709)
-- Dependencies: 230
-- Data for Name: departements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departements (id, nom, description, "etablissementId") FROM stdin;
1	GÉNIE INFORMATIQUE		1
\.


--
-- TOC entry 5121 (class 0 OID 31692)
-- Dependencies: 228
-- Data for Name: equipes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipes (id, nom, description, "universityId") FROM stdin;
1	Équipe IA et Machine Learning	Recherche en intelligence artificielle, apprentissage automatique et traitement du langage naturel	3
\.


--
-- TOC entry 5117 (class 0 OID 31658)
-- Dependencies: 224
-- Data for Name: etablissements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etablissements (id, nom, adresse, ville, pays, "Logo", "universityId") FROM stdin;
1	FST Tanger	Route Boukhalef, Tangier, Tangier-tetouan 90000 	Tanger	Maroc	https://fstt.ac.ma/Portail2023/wp-content/uploads/2023/03/fst-1024x383.png	3
2	FST Fes	Route Imouzzer, FES 30000	Fes	Maroc	https://fst-usmba.ac.ma/framework/themes/fstf/images/logo_fstf_x.png	5
\.


--
-- TOC entry 5151 (class 0 OID 31981)
-- Dependencies: 258
-- Data for Name: experiences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.experiences (id, poste, entreprise, description, "dateDebut", "dateFin", "enCours", "cvId") FROM stdin;
1	stagier	SAT	audit	2023-03-15	2023-06-15	f	1
2	End-of-Studies Internship	 Smart Automation Technologies	– Development of a full-stack web application for managing physical, legal, and organizational structures.\n– Implementation of a modular architecture and intuitive interface for resource administration.	2024-04-15	2024-06-23	f	4
\.


--
-- TOC entry 5145 (class 0 OID 31936)
-- Dependencies: 252
-- Data for Name: formations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formations (id, diplome, etablissement, "dateDebut", "dateFin", "enCours", "cvId") FROM stdin;
2	Master securite It et Big Data	FST Tanger	2024-09-20	2026-06-15	t	1
3	Master sitbd	fst tanger	2024-10-15	\N	t	3
1	license	fst tanger	2020-10-04	2024-06-16	f	1
4	Master’s in IT Security and Big Data	Faculty of Science and Technology, Tangier	2024-09-20	\N	t	4
5	Bachelor’s in Computer Application Development Engineering	Faculty of Science and Technology, Tangier	2020-10-15	2024-06-23	f	4
\.


--
-- TOC entry 5131 (class 0 OID 31817)
-- Dependencies: 238
-- Data for Name: google_scholar_integrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.google_scholar_integrations (id, "googleScholarId", "profileUrl", "lastSynced", "userId") FROM stdin;
3	Qbl0uskAAAAJ	https://scholar.google.com/citations?user=Qbl0uskAAAAJ	2026-02-11	5
4	3RA5IZkAAAAJ	https://scholar.google.com/citations?user=3RA5IZkAAAAJ	2026-03-23	4
\.


--
-- TOC entry 5158 (class 0 OID 32070)
-- Dependencies: 265
-- Data for Name: group_chat_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.group_chat_members (chat_id, user_id) FROM stdin;
\.


--
-- TOC entry 5119 (class 0 OID 31675)
-- Dependencies: 226
-- Data for Name: laboratoires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.laboratoires (id, nom, description, "universityId") FROM stdin;
1	Laboratoire d'Informatique	Recherche en IA et ML	3
\.


--
-- TOC entry 5149 (class 0 OID 31966)
-- Dependencies: 256
-- Data for Name: langues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.langues (id, nom, niveau, "cvId") FROM stdin;
1	arabe	C2	1
2	francais	B2	1
3	anglais	B2	1
4	Arabe	C2	4
5	French	B1	4
6	English	B2	4
\.


--
-- TOC entry 5153 (class 0 OID 31996)
-- Dependencies: 260
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, content, "timestamp", "chatId", "senderId", attachment, is_read) FROM stdin;
100	salut cv	2026-02-10 23:44:15.075501	13	5	\N	1
101		2026-02-10 23:44:23.045264	13	5	http://localhost:8000/upload/files/bd3f6253-aa59-4b98-a3dc-6cb5d9090117.pdf	1
\.


--
-- TOC entry 5139 (class 0 OID 31889)
-- Dependencies: 246
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, content, "timestamp", attachement, "isPublic", "userId", "publicationId", "scopusPublicationId") FROM stdin;
4	sharing my cv for new opprotunities	2026-02-03 10:15:45.254458	http://localhost:8000/upload/files/59de43d4-8fc7-4368-b66f-da136dbb5847.pdf	t	5	\N	\N
15	IDCBR-MAS\n\nAuthors: Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle	2026-02-09 12:36:24.574891	\N	f	4	45	\N
20	test	2026-03-05 22:56:34.565038	http://localhost:8000/upload/files/f77a9d50-7454-417e-a4b0-1d549c535c9d.pdf	f	5	\N	\N
21	hello everyone	2026-03-05 22:58:41.7741	\N	t	4	\N	\N
22	Review on Training LLMs on One Single GPU in Term of Speed, Efficiency, Memory and Energy Consumption\n\nAuthors: Jouad M.B. | Published in: Studies in Systems Decision and Control | Year: 2026	2026-03-12 20:22:04.235027	\N	f	6	\N	27
25	CONTRIBUTION TO THE NEGOTIATION AND QOS OPTIMIZATION IN CLOUD COMPUTING FOR BIG DATA STORAGE AND PROCESSING\n\nAuthors: GIBET TANI Hicham, EL AMRANI Chaker	2026-03-12 20:26:12.116332	\N	f	5	100	\N
26	test	2026-03-12 22:31:52.341783	\N	f	4	\N	\N
28	fff	2026-03-25 14:46:43.555978	http://localhost:8000/upload/files/176f6a20-fe34-4b8d-beff-b08656dbe998.pdf	f	4	\N	\N
29	Modelisation and Implementation of our System Incremental Dynamic Case Based Reasoning founded In the MAS under JADE Plate-Form\n\nAuthors: Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle	2026-03-25 14:54:28.083467	\N	f	4	147	\N
\.


--
-- TOC entry 5129 (class 0 OID 31802)
-- Dependencies: 236
-- Data for Name: projets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projets (id, titre, description, budget, "dateDebut", "dureeEnMois", statut, "userId") FROM stdin;
1	Optimisation des Algorithmes de Traitement du Langage Naturel	Recherche appliquée sur l'optimisation des modèles NLP pour améliorer la compréhension du contexte dans les textes académiques. Collaboration avec plusieurs universités partenaires.	75000	2026-02-25	12	planifié	6
\.


--
-- TOC entry 5141 (class 0 OID 31904)
-- Dependencies: 248
-- Data for Name: publications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.publications (id, title, abstract, summary, "publicationDate", "citationCount", "googleScholarUrl", "isPosted", "googleScholarIntegrationId") FROM stdin;
56	An innovative air purification method and neural network algorithm applied to urban streets	In the present work, multiphysics modeling was used to investigate the feasibility of a photocatalysis-based outdoor air purifying solution that could be used in high polluted streets, especially street canyons. The article focuses on the use of a semi-active photocatalysis in the surfaces of the street as a solution to remove anthropogenic pollutants from the air. The solution is based on lamellae arranged horizontally on the wall of the street, coated with a photocatalyst (TiO2), lightened with UV light, with a dimension of 8 cm× 48 cm× 1 m. Fans were used in the system to create airflow. A high purification percentage was obtained. An artificial neural network (ANN) was used to predict the optimal purification method based on previous simulations, to design purification strategies considering the energy cost. The ANN was used to forecast the amount of purified with a feed-forward neural network and a backpropagation …	Authors: Meryeme Boumahdi, Chaker El Amrani, Siegfried Denys | Published in: Research Anthology on Artificial Neural Network Applications | Year: 2022	2022-01-01	7	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:Wp0gIr-vW9MC	f	3
57	Detection of Human Activities in Wildlands to Prevent the Occurrence of Wildfires Using Deep Learning and Remote Sensing	Human activities in wildland are responsible for the largest part of wildfire cases. This paper presents a work that uses deep learning on remote sensing images to detect human activity in wildlands to prevent fire occurrence that can be caused by humans. Human activities can be presented as any human interaction with wildlands, and it can be roads, cars, vehicles, homes, human shapes, agricultural lands, golfs, airplanes, or any other human proof of existence or objects in wild lands. Conventional neural network is used to classify the images. For that, we used three approaches, in which one is the object detection and scene classification approach, the second is land class approach where two classes of lands can be considered which are wildlands with human interactions and wildland without human interaction. The third approach is more general and includes three classes that are urban lands, pure wildlands …	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: Networking, Intelligent Systems and Security: Proceedings of NISS 2021 | Year: 2021	2021-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:9yKSN-GCB0IC	f	3
58	of Wildfires Using Deep Learning and Remote Sensing	Human activities in wildland are responsible for the largest part of wildfire cases. This paper presents a work that uses deep learning on remote sensing images to detect human activity in wildlands to prevent fire occurrence that can be caused by humans. Human activities can be presented as any human interaction with wildlands, and it can be roads, cars, vehicles, homes, human shapes, agricultural lands, golfs, airplanes, or any other human proof of existence or objects in wild lands. Conventional neural network is used to classify the images. For that, we used three approaches, in which one is the object detection and scene classification approach, the second is land class approach where two classes of lands can be considered which are wildlands with human interactions and wildland without human interaction. The third approach is more general and includes three classes that are urban lands, pure wildlands, and wildlands with human activities. The results show that it is possible to detect human activities in wildlands using the models presented in this paper. The second approach can be considered the most successful even if it is the simpler.	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: Networking, Intelligent Systems and Security: Proceedings of NISS 2021 | Year: 2021	2021-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:hFOr9nPyWt4C	f	3
59	SAT-CEP-monitor: An air quality monitoring software architecture combining complex event processing with satellite remote sensing	\N	Authors: Badr-Eddine Boudriki Semlali, Chaker El Amrani, Guadalupe Ortiz, Juan Boubeta-Puig, Alfonso Garcia-de-Prado | Published in: Computers & Electrical Engineering | Year: 2021	2021-01-01	48	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:Tyk-4Ss8FVUC	f	3
60	Big data and remote sensing: A new software of ingestion	\N	Authors: Badr Eddine Boudriki Semlali, Chaker El Amrani | Published in: International Journal of Electrical and Computer Engineering | Year: 2021	2021-01-01	28	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:YOwf2qJgpHMC	f	3
67	SAT-ETL-Integrator: an extract-transform-load software for satellite big data ingestion	Satellite data are used in several environmental applications, particularly in air quality supervising, climate change monitoring, and natural disaster predictions. However, remote sensing (RS) data occur in huge volume, in near-real time, and are stored inside complex structures. We aim to prove that satellite data are big data (BD). Accordingly, we propose a software as an extract-transform-load tool for satellite data preprocessing. We focused on the ingestion layer that will enable an efficient RSBD integration. As a result, the developed software layer receives data continuously and removes ∼86  %   of the unused files. This layer also eliminates nearly 20% of erroneous datasets. Thanks to the proposed approach, we successfully reduced storage space consumption, enhanced the RS data accuracy, and integrated preprocessed datasets into a Hadoop distributed file system.	Authors: Badr-Eddine Boudriki Semlali, Chaker El Amrani, Guadalupe Ortiz | Published in: Journal of Applied Remote Sensing | Year: 2020	2020-01-01	38	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:UebtZRa9Y70C	f	3
47	Hybrid Parallel Architecture Integrating FFN, 1D CNN, and LSTM for Predicting	A novel “Hybrid Parallel Architecture Integrating FFN, 1D CNN, and LSTM” is presented to enhance wildfire prediction capabilities in Morocco. Utilizing the “Morocco Wildfire Predictions: 2010-2022 ML Dataset", this model merges various data points, including meteo-rological conditions, human population density, and environmental fac-tors like soil moisture and vegetation indices. The architecture combines feedforward neural networks (FFN), one-dimensional convolutional neural networks (1D CNN), and long short-term memory networks (LSTM) to process different subsets of features in parallel, capturing both spatial and temporal dependencies crucial for accurate wildfire predictions. The dataset covers data from 2010 to 2022 and includes standard-ized features specifically prepared for machine learning applications in disaster management. By training this hybrid model, significant validation accuracy was observed, indicating robust performance. Initial results were promising, with the model achieving an accuracy of 83.96% on the training set and 87.19% on the validation set during the first epoch, improving to 87.13% on the training set and 87.56% on the validation set by the second epoch.	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: Innovations in Smart Cities Applications Volume 8: Proceedings of the 9th International Conference on Smart City Applications | Year: 2025	2025-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:aqlVkmm33-oC	f	3
48	Deep Learning with Pretrained'Internal World'Layers: A Gemma 3-Based Modular Architecture for Wildfire Prediction	\N	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: arXiv preprint arXiv:2504.18562 | Year: 2025	2025-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:_FxGoFyzp5QC	f	3
49	Physics-Embedded Deep Learning for Wildfire Risk Assessment: Integrating Statistical Mechanics into Neural Networks for Interpretable Environmental Modeling	This paper introduces a groundbreaking framework that fuses physical laws from statistical mechanics with deep learning to advance wildfire risk assessment. At its core is the" Physics-Embedded Entropy Layer," which adapts the Boltzmann-Gibbs entropy formula to measure landscape complexity and wildfire susceptibility using tabular environmental data. Integrated as a trainable middle layer within a Parallel Multi-path Feed Forward Neural Network (PMFFNN), this layer transforms raw inputs—such as vegetation indices, soil moisture, and meteorological data from the" Morocco Wildfire Predictions: 2010-2022 ML Dataset"—into an interpretable, physically grounded representation. A hybrid training approach, combining pretraining of the entropy layer with end-to-end fine-tuning, enables the model to achieve competitive precision and AUC scores, affirming its potential for reliable early warning systems. Although …	Authors: Ayoub JADOULI, Chaker El AMRANI | Year: 2025	2025-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:8k81kl-MbHgC	f	3
50	Advanced Wildfire Prediction in Morocco: Developing a Deep Learning Dataset From Multisource Observations	\N	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: IEEE Access | Year: 2024	2024-01-01	6	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:hC7cP41nSMkC	f	3
51	Parallel Multi-path Feed Forward Neural Networks (PMFFNN) for Long Columnar Datasets: A Novel Approach to Complexity Reduction	\N	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: arXiv preprint arXiv:2411.06020 | Year: 2024	2024-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:ZeXyd9-uunAC	f	3
52	Hybrid Parallel Architecture Integrating FFN, 1D CNN, and LSTM for Predicting Wildfire Occurrences in Morocco	A novel “Hybrid Parallel Architecture Integrating FFN, 1D CNN, and LSTM” is presented to enhance wildfire prediction capabilities in Morocco. Utilizing the “Morocco Wildfire Predictions: 2010–2022 ML Dataset”, this model merges various data points, including meteorological conditions, human population density, and environmental factors like soil moisture and vegetation indices. The architecture combines feedforward neural networks (FFN), one-dimensional convolutional neural networks (1D CNN), and long short-term memory networks (LSTM) to process different subsets of features in parallel, capturing both spatial and temporal dependencies crucial for accurate wildfire predictions.	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: The Proceedings of the International Conference on Smart City Applications | Year: 2024	2024-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:IjCSPb-OGe4C	f	3
53	Enhancing wildfire forecasting through multisource spatio-temporal data, deep learning, ensemble models and transfer learning	\N	Authors: Ayoub Jadouli, Chaker El Amrani | Published in: arXiv preprint arXiv:2407.15878 | Year: 2024	2024-01-01	7	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:mB3voiENLucC	f	3
54	Bridging Physical Entropy Theory and Deep Learning for Wildfire Risk Assessment: A Hybrid Pretraining and Fine-Tuning Approach with Satellite Data	This paper introduces a novel theoretical framework for wildfire risk assessment that merges principles from statistical mechanics with advanced deep learning techniques. We propose an adaptation of the Boltzmann-Gibbs entropy formula to quantify landscape complexity through grid cell entropy, leveraging multi-spectral satellite imagery from multiple platforms to capture detailed spatial-temporal patterns. Our framework combines a mathematical formulation integrating land cover diversity and environmental parameters with a sophisticated deep learning architecture that pairs 3D Convolutional Neural Networks with multi-path feed-forward networks. The architecture processes seven-channel satellite imagery at 16km× 16km resolution and employs a two-phase training strategy utilizing transfer learning to adapt entropy-based features for wildfire risk classification. While primarily theoretical, our framework provides a rigorous foundation for advancing wildfire prediction capabilities, offering a new direction in environmental risk assessment that combines physical principles with modern machine learning techniques, with potential applications beyond wildfire management.	Authors: Ayoub JADOULI, Chaker EL AMRANI | Published in: Preprint | Year: 2023	2023-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:3fE2CSJIrl8C	f	3
55	Implementation of an Intelligent Model to Predict Solar Energy in North Morocco	Air pollution is mainly due to the use of fossil energy in industrial and transport activities [1, 2]. A solution to this problem is to replace fossil fuels by solar energy. This study is about the prediction of solar energy production, in order to decide when and where the switch between the two sources can be made. In this work, different prediction techniques weretested. They were developed with different Machine Learning models, namely, Decision Tree, Random Forest and Neural Networks. The best proposedalgorithmwas implemented in a Web application that shows prediction results, based on environmental variables values.	Authors: Chaker El Amrani, Kawtar Chmichi | Published in: International Journal of Computer Applications | Year: 2022	2022-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:IWHjjKOFINEC	f	3
61	Satellite image inpainting with deep generative adversarial neural networks	This work addresses the problem of recovering lost or damaged satellite image pixels (gaps) caused by sensor processing errors or by natural phenomena like cloud presence. Such errors decrease our ability to monitor regions of interest and significantly increase the average revisit time for all satellites. This paper presents a novel neural system based on conditional deep generative adversarial networks (cGAN) optimized to fill satellite imagery gaps using surrounding pixel values and static high-resolution visual priors. Experimental results show that the proposed system outperforms traditional and neural network baselines. It achieves a normalized least absolute deviations error of 𝐿1= 0.33 (21% and 60% decrease in error compared with the two baselines) and a mean squared error loss of ℒ2= 0.15 (29% and 73% decrease in error) over the test set. The model can be deployed within a remote sensing data pipeline to reconstruct missing pixel measurements for near-real-time monitoring and inference purposes, thus empowering policymakers and users to make environmentally informed decisions.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: IAES Int. J. Artif. Intell.(IJ-AI) | Year: 2021	2021-01-01	21	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:dhFuZR0502QC	f	3
62	Satellite big data ingestion for environmentally sustainable development	Currently, many environmental applications take advantage of remote sensing techniques, particularly air quality monitoring, climate changes overseeing, and natural disasters prediction. However, a massive volume of remote sensing data is generated in near-real-time; such data are complex and are provided with high velocity and variety. This study aims to confirm that satellite data are big data and proposes a new big data architecture for satellite data processing. In this paper, we mainly focused on the ingestion layer enabling an efficient remote sensing big data preprocessing. As a result, the developed ingestion layer removed eighty-sixe percent of the unnecessary daily files. Moreover, it eliminated about twenty percent of the erroneous and inaccurate plots, therefore, reducing storage consumption and improving satellite data accuracy. Finally, the processed data was efficiently integrated into a Hadoop …	Authors: Badr-Eddine Boudriki Semlali, Chaker El Amrani | Published in: Emerging Trends in ICT for Sustainable Development: The Proceedings of NICE2020 International Conference | Year: 2021	2021-01-01	15	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:WF5omc3nYNoC	f	3
63	Satellite imagery noising with generative adversarial networks	Using satellite imagery and remote sensing data for supervised and self-supervised learning problems can be quite challenging when parts of the underlying datasets are missing due to natural phenomena (clouds, fog, haze, mist, etc.). Solving this problem will improve remote sensing data augmentation and make use of it in a world where satellite imagery represents a great resource to exploit in any big data pipeline setup. In this paper, the authors present a generative adversarial network (GANs) model that can generate natural atmospheric noise that serves as a data augmentation preprocessing tool to produce input to supervised machine learning algorithms.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: International Journal of Cognitive Informatics and Natural Intelligence (IJCINI) | Year: 2021	2021-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:u-x6o8ySG0sC	f	3
64	A stream processing software for air quality satellite datasets	There is no doubt that air pollution harms human health. Municipal areas are the most affected by the degradation of the air quality by discharging anthropogenic gases from transport and industrial activities. This research collected remote sensing data from numerous satellite sensors to efficiently monitor the air quality in near-real-time. This paper deliberates the developed software based on the complex event processing calculating in streaming the air quality level in Morocco and Spain. Therefore, this computer program extracts only useful information rapidly from remote sensing big data helping decision-makers. This investigation takes up also a validation between the air quality measured by the ground station data of Andalucía and Madrid regions and the used satellite sensors data.	Authors: Badr-Eddine Boudriki Semlali, Chaker El Amrani | Published in: International Conference on Advanced Intelligent Systems for Sustainable Development | Year: 2020	2020-01-01	13	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:5nxA0vEk-isC	f	3
65	Machine learning methods for air quality monitoring	Machine learning algorithms, and especially deep neural networks, provide universal estimator paradigms to approximate optimal solutions for arbitrary domain-specific problems. On the other hand, environmental-related problems that are a direct result of our rapidly changing climate are, nowadays, of the highest importance. Recently, the adoption of machine learning algorithms for environmental modeling has increased, especially in time series forecasting and computer vision. In this review, we attempt to provide a unified and systematic survey of the current machine learning algorithms used to solve multiple air quality monitoring tasks. We specifically focus on air quality modeling using satellite imagery and sensor device data. Lastly, we propose future directions with neural network modeling and representation learning.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: Proceedings of the 3rd International Conference on Networking, Information …, 2020 | Year: 2020	2020-01-01	11	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:qxL8FJ1GzNcC	f	3
66	Hadoop paradigm for satellite environmental big data processing	The important growth of industrial, transport, and agriculture activities, has not led only to the air quality and climate changes issues, but also to the increase of the potential natural disasters. The emission of harmful gases, particularly: the Vertical Column Density (VCD) of CO, SO2 and NOx, is one of the major factors causing the aforementioned environmental problems. Our research aims to contribute finding solution to this hazardous phenomenon, by using remote sensing (RS) techniques to monitor air quality which may help decision makers. However, RS data is not easy to manage, because of their huge amount, high complexity, variety, and velocity, Thus, our manuscript explains the different aspects of the used satellite data. Furthermore, this article has proven that RS data could be regarded as big data. Accordingly, we have adopted the Hadoop big data architecture and explained how to process efficiently …	Authors: Badr-Eddine Boudriki Semlali, Chaker El Amrani, Guadalupe Ortiz | Published in: International Journal of Agricultural and Environmental Information Systems (IJAEIS) | Year: 2020	2020-01-01	26	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:hqOjcs7Dif8C	f	3
68	Ozonet: Atmospheric ozone interpolation with deep convolutional neural networks	We propose a deep learning method for Atmospheric Ozone Interpolation. Our method directly learns an end-to-end mapping between classically interpolated satellite ozone images and the real ozone measurements. The model's architecture represents a deep stack of convolutions (CNN) that takes the already interpolated images (Using the classical state-of-the-art interpolation method) as Input and outputs a more precise Interpolation of the Region of Interest. Our deep CNN has a lightweight structure, yet demonstrates state-of-the-art interpolation quality, and achieves optimal data processing latency (∆T) for production-ready near-real-time Atmospheric Image Interpolation, which has a big advantage over the state of the art classical interpolation algorithms. We explore different network structures and parameter settings to achieve trade-offs between performance and speed. This method showcases the potential applications of deep learning in Remote Sensing and Climate Science.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: Geoscientific Instrumentation, Methods and Data Systems Discussions | Year: 2019	2019-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:qjMakFHDy7sC	f	3
69	Development of a Java-based application for environmental remote sensing data processing	Air pollution is one of the most serious problems the world faces today. It is highly necessary to monitor pollutants in real-time to anticipate and reduce damages caused in several fields of activities. Likewise, it is necessary to provide decision makers with useful and updated environmental data. As a solution to a part of the above-mentioned necessities, we developed a Javabased application software to collect, process and visualize several environmental and pollution data, acquired from the Mediterranean Dialog earth Observatory (MDEO) platform [1]. This application will amass data of Morocco area from EUMETSAT satellites, and will decompress, filter and classify the received datasets. Then we will use the processed data to build an interactive environmental real-time map of Morocco. This should help finding out potential correlations between pollutants and emitting sources.	Authors: Bad-Reddine Boudriki Semlali, Chaker El Amrani, Siegfried Denys | Published in: International Journal of Electrical and Computer Engineering | Year: 2019	2019-01-01	23	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:HDshCWvjkbEC	f	3
70	Adopting the Hadoop architecture to process satellite pollution big data	This research aims to monitor abnormal climate changes and supervise Air Quality (AQ), especially in Morocco. This study aims to contribute to finding a solution to the AQ degradation and climate change issues by using Remote Sensing (RS) techniques. RSBD in NRT is collected from six sources: the MDEO ground station of EUMETSAT data, the EOSDIS data of NASA, the NESDIS data of NOAA, and the Copernicus platform, some MGS data, and the Raspberry PI sensors data. The current manuscript explains the different aspects of the used satellite data, proving that satellite data could be regarded as Big Data (BD). Accordingly, this research has proposed a Hadoop BD architecture and explained how to efficiently process RS environmental data. This architecture comprises six main layers: the data sources, data ingestion, data storage, data processing, data visualization, and the monitoring layer. The aforementioned architecture automatically collects filters, extracts, and stores data into the HDFS. This proposed model would be beneficial in managing adverse climate conditions and prevent natural disasters.	Authors: B-E Boudriki Semlali, Chaker El Amrani, Guadalupe Ortiz | Published in: Int. j. technol. eng. stud | Year: 2019	2019-01-01	14	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:ULOm3_A8WrAC	f	3
71	MetOp satellites data processing for air pollution monitoring in Morocco	This paper presents a data processing system based on an architecture comprised of multiple stacked layers of computational processes that transforms Raw Binary Pollution Data coming directly from Two EUMETSAT MetOp satellites to our servers, into ready to interpret and visualise continuous data stream in near real time using techniques varying from task automation, data preprocessing and data analysis to machine learning using feedforward artificial neural networks. The proposed system handles the acquisition, cleaning, processing, normalizing, and predicting of Pollution Data in our area of interest of Morocco.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: International Journal of Electrical & Computer Engineering | Year: 12	0012-12-01	7	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:d1gkVwhDpl0C	f	3
72	The Mediterranean Dialogue Earth Observatory’s Data Pipeline and Current Developments	MDEO, or The Mediterranean Dialogue Earth Observatory, is a NATO for peace sponsored project fully deployed in the faculty of sciences in Tangier, Morocco. It consists mainly of a ground station connected to a cluster in LIST (Laboratory of Informatics, Systems, and Telecommunications). The objective of this initiative is to ensure reliable weather and pollution monitoring and help us better understand and warn against environmental disasters using a wide range of spatiotemporal variables, applying varying techniques from remote sensing to data science and making use of the Big environmental data it receives from multiple satellites in real/near-real time. In this paper, we present a complete overview of the MDEO project and its connected entities, we describe the data processes and components of the full pipeline, and finally, we evaluate some of the current developments and use cases of the data MDEO …	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: The Proceedings of the Third International Conference on Smart City Applications | Year: 2018	2018-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:W7OEmFMy1HYC	f	3
73	Outdoor air purification based on photocatalysis and artificial intelligence techniques	Multiphysics simulation had progressed significantly in the recent years so that predictions of flow around and inside complex geometries are now possible. In this work multiphysics is used to test the efficiency of a new, innovative solution for outdoor air purification using photocatalysis technology. Photocatalysis has received considerable attention in recent years with a huge potential in air purification applications. The work focusses on the semi-active use of photocatalytic surfaces in streets as an innovative method for removing anthropogenic pollutants (especially volatile organic compounds or VOCs) from urban air. This study combines different scientific fields: Physics, Chemistry and Computer engineering. The objective of this work is to design an air purified solution to be implemented in four streets in Tangier. To achieve this goal several techniques were evaluated using COMSOL and Matlab. Artificial …	Authors: Meryeme Boumahdi, Chaker El Amrani | Published in: The Proceedings of the Third International Conference on Smart City Applications | Year: 2018	2018-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:UeHWp8X0CEIC	f	3
74	THE OPTIMIZATION OF COMPUTE RESOURCES SCHEDULING IN CLOUD COMPUTING ENVIRONMENTS USING ARTIFICIAL NEURAL NETWORKS.	Compute resources scheduling is an essential aspect of any computing paradigm and it becomes a decisive feature for cloud computing model given the new service delivery model proposed by this innovative computing technology. To the extent of our knowledge, one of the most used scheduling algorithms, up to this moment, is Round Robin scheduling considering its time-shared design, which assigns a time slice (time quantum) to each task or job scheduled for execution on the Core Processing Unit (CPU). Mostly, all computer platforms using Round Robin scheduling, comprised the ones used on Cloud Computing environments, adopts a fixed value for time quantum that usually causes processor thrashing. In this paper, a new compute resources scheduling algorithm is proposed, in which it uses the Round Robin time-shared design with a dynamic time quantum extracted from scheduled tasks characteristics. Moreover, Artificial Neural Networks capabilities of prediction and classification are used in order to automatically select the finest time quantum calculation method that would optimize the average waiting and turnaround time of the compute resources scheduler intended for cloud computing environments. Additionally, a comparison of the proposed algorithm with the First Come First Served and the simple Round Robin algorithms is discussed in order to highlight the significance of our proposed method.	Authors: Gibet Tani Hicham, EL AMRANI CHAKER, ELAACHAK LOTFI | Published in: Journal of Theoretical & Applied Information Technology | Year: 2018	2018-01-01	5	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:u5HHmVD_uO8C	f	3
75	Processing EUMETSAT Big Datasets to Monitor Air Pollution	Air pollution is one of the major problems in the world. According to the World Health Organization (WHO), exposure to high levels of such emissions can cause serious diseases such as asthma, bronchitis and lung cancer. Several cities in Morocco like Casablanca, Safi and Tangier are suffering from harmful air pollution, due to industrial and farming activities, intensive roads and maritime traffic and thermal power plants carbon emissions. To mitigate pollution effects, Morocco launched several action plans to reduce gas emissions. Within this context, a real-time remote sensing ground station of the Mediterranean Dialogue Earth Observatory (MDEO) was established at Abdelmalek Essaadi University in Tangier with support from the North Atlantic Treaty Organization (NATO) Science for Peace Division for early warning of biogenic and anthropogenic disasters. The ground station includes ingestion from both …	Authors: Chaker El Amrani, Mohamed Akram Zaytar, Gilbert L Rochon, Tarek El-Ghazawi | Published in: EGU General Assembly Conference Abstracts | Year: 4	0004-04-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:Se3iqnhoufwC	f	3
76	Smarter round robin scheduling algorithm for cloud computing and big data	\N	Authors: Hicham Gibet Tani, Chaker El Amrani | Published in: Journal of Data Mining and Digital Humanities | Year: 2018	2018-01-01	54	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:qUcmZB5y_30C	f	3
77	Algorithme de planification intelligent Round Robin pour le Cloud Computing et Big Data	Cloud Computing and Big Data are the upcoming Information Technology (IT) computing models. These groundbreaking paradigms are leading IT to a new set of rules that aims to change computing resources delivery and exploitation model, thus creating a novel business market that is exponentially growing and attracting more and more investments from both providers and end users that are looking forward to make profits from these innovative models of computing. In the same context, researchers and investigators are wrestling time in order to develop, test and optimize Cloud Computing and Big Data platforms, whereas several studies are ongoing to determine and enhance the essential aspects of these computing models especially compute resources allocation. The processing power scheduling is crucial when it comes to Cloud Computing and Big Data because of the data growth management and delivery design proposed by these new computing models, that requires faster responses from platforms and applications. Hence originates the importance of developing high efficient scheduling algorithms that are compliant with these computing models platforms and infrastructures requirement.	Authors: Hicham GIBET TANI, Chaker EL AMRANI | Published in: Journal of Data Mining & Digital Humanities | Year: 2018	2018-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:ufrVoPGSRksC	f	3
78	Year of Publication: 2018	This article aims to present an end-to-end software solution capable of providing up to date weather and pollution values and health recommendations based on User profiles and personal health data, while making use of environmental satellite data processed in the back-end. this system demonstrates the possible range of applications of satellite-backed environmental systems that can assist and potentially replace the current expensive sensor-based systems, especially in developing countries in Africa.	Authors: Mohamed Akram Zaytar, Mohamed Amrani, Chaker El Amrani | Year: 2018	2018-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:0EnyYjriUFMC	f	3
79	A Data Processing System to Monitor Emissions from Thermal Plants in Morocco	This paper presents a data processing system comprised of multiple layers of computational processes that transform the raw binary meteorological data coming directly from two EUMETSAT Metop satellites to our servers, into a ready to visualise and interpret data stream in near real time using techniques varying from software automation, data preprocessing and general data analysis concepts. The proposed system handles the acquisition, decoding, cleaning, processing, and normalization of pollution data in our area of interest of Morocco.	Authors: Mohamed Akram Zaytar, Chaker El Amrani, Abderrahman El Kharrim, Mohamed Ben Ahmed, Mohammed Bouhorma | Published in: Proceedings of the Mediterranean Symposium on Smart City Applications | Year: 2017	2017-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:9ZlFYXVOiuMC	f	3
98	Enhancing Wildfire Prediction Accuracy through Positional Encoding and Advanced Neural Architectures	Wildfires significantly impact ecosystems, property, and human life globally. Accurate prediction of these events is crucial for effective intervention and resource management. This paper introduces an advanced approach utilizing multi-source spatiotemporal satellite data alongside distinct neural network architectures to enhance wildfire prediction accuracy. We explore three models: a standard feedforward neural network (FFN), a transformer model with multi-head attention, and an innovative feedforward network integrated with positional encoding (FFN-PE).	Authors: Ayoub Jadouli, Chaker El Amrani	\N	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:Zph67rFs4hoC	f	3
80	Optimization of task scheduling algorithms for cloud computing: A review	Cloud Computing is one of the most recognized computing paradigms in our time, where Information Technology (IT) resources and services are supplied on-demand over the Internet. Nowadays, almost everyone is using the cloud whether it is an email platform, an online storage or a complicated online datacenter for business high-scale deployments. Following the recent statistics and analytics, cloud computing business market is growing each year in term of demand and revenue. This business growth is pushing cloud providers to expand their infrastructures in order to manage the users’ increasing level of requests. In the same context, this paper presents the importance of task scheduling algorithms in the optimization of the cloud providers’ infrastructures exploitation, thus a significant cost reduction in term of new hardware investments and maintenance.	Authors: Gibet Tani Hicham, El Amrani Chaker | Published in: Proceedings of the Mediterranean Symposium on Smart City Applications, 664-672, 2017 | Year: 2017	2017-01-01	5	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:4DMP91E08xMC	f	3
81	Cloud Computing CPU Allocation and Scheduling Algorithms Using CloudSim Simulator.	Cloud Computing is an emerging computing model, whereas Cloud providers and users are looking forward to profit and enhance their IT exploitation. In this paper, we describe and discuss the Cloud Computing basic compute resources scheduling and allocation algorithms, in addition to the working mechanism. This paper also presents a number of experiments conducted based on CloudSim simulation toolkit in order to assess and evaluate the performance of these scheduling algorithms on Cloud Computing like infrastructure. Furthermore, we introduced and explained the CloudSim simulator design, architecture and proposed two new scheduling algorithms to enhance the existent ones and highlight the weaknesses and/or effectiveness of these algorithms.	Authors: Gibet Tani Hicham, El Amrani Chaker | Published in: International Journal of Electrical & Computer Engineering (2088-8708) | Year: 2016	2016-01-01	56	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:mVmsd5A6BfQC	f	3
82	Sequence to sequence weather forecasting with long short-term memory recurrent neural networks	The aim of this paper is to present a deep neural network architecture and use it in time series weather prediction. It uses multi stacked LSTMs to map sequences of weather values of the same length. The final goal is to produce two types of models per city (for 9 cities in Morocco) to forecast 24 and 72 hours worth of weather data (for Temperature, Humidity and Wind Speed). Approximately 15 years (2000-2015) of hourly meteorological data was used to train the model. The results show that LSTM based neural networks are competitive with the traditional methods and can be considered a better alternative to forecast general weather conditions.	Authors: Mohamed Akram Zaytar, Chaker El Amrani | Published in: International Journal of Computer Applications | Year: 6	0006-06-01	401	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:LkGwnXOMwfcC	f	3
83	A comparative study of simple clear sky irradiance models	\N	Authors: Abdoul Kader Sidibe, Mounir Ghogho, Chaker El Amrani, Mustapha Faquir | Published in: 2016 International Conference on Electrical and Information Technologies (ICEIT) | Year: 2016	2016-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:-f6ydRqryjwC	f	3
84	Remote Sensing for Real-time Early Warning of Environmental Disasters and WRF Modelling. e	The Mediterranean Dialogue Earth Observatory (MDEO) is a NATO Science for Peace sponsored project, deployed at Abdelmalek Essaadi University in Tangier. It provides real-time and nearreal-time data from EUMETSAT multiple earth observing satellites and permits early warning for an array of environmental disasters, such as flash inundations, storms, atmospheric pollution, landslides, etc. Raw data are transmitted to the ground station and the acquisition server, then, selected files are pushed to the processing server where they are sorted and analyzed with appropriate programs. Numerical Weather Prediction (NWP) models use satellite datasets as initial conditions to run the program, and make predictions. This procedure could help decision makers taking adequate measures to mitigate natural disaster risks.	Authors: Chaker El Amrani | Published in: AGE | Year: 2015	2015-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:M3ejUd6NZC8C	f	3
85	Approaches for High-Performance Big Data Processing	Social media websites, such as Facebook, Twitter, and YouTube, and job posting websites like LinkedIn and CareerBuilder involve a huge amount of data that are very useful to economy assessment and society development. ese sites provide sentiments and interests of people connected to web communities and a lot of other information. e Big Data collected from the web is considered as an unprecedented source to fuel data processing and business intelligence. However, collecting, storing, analyzing, and processing these Big Data as quickly as possible create new challenges for both scientists and analytics. For example, analyzing Big Data from social media is now widely accepted by many companies as a way of testing the acceptance of their products and services based on customers’ opinions. Opinion mining or sentiment	Authors: Ouidad Achahbar, Mohamed Riduan Abid, Mohamed Bakhouya, Chaker El Amrani, Jaafar Gaber, Mohammed Essaaidi, T El Ghazawi | Published in: Big Data: Algorithms, Analytics, and Applications | Year: 2015	2015-01-01	12	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:QIV2ME_5wuYC	f	3
86	MarUnivCloud: Towards a moroccan inter-university cloud	Cloud Computing is emerging as a very promising technology changing the way we approach	Authors: Mohamed Riduan Abid, Ismail Fassi Fihri, Hajar Mousannif, Mohamed Bakhouya, Chaker El Amrani, Mohammed Aissaoui, M El Ouadghiri, Abdelkrim Haqiq, Aawatif Hayar, Mohamed Essaaidi | Published in: Proc. 2nd World Conference on Complex Systems (IEEE WCCS) | Year: 2014	2014-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:TQgYirikUcIC	f	3
87	A learning approach to introducing gpu computing in undergraduate engineering program	The graphics processing unit (GPU) learning initiative is developed within a project awarded by the Moroccan Fulbright Alumni Association (MFAA), entitled “GPU Acceleration of Human Genome Sequencing”. This project involves undergraduate students at Abdelmalek Essaadi University, and is conducted in collaboration with the High Performance Computing Lab (HPCL) at the George Washington University in US	Authors: Chaker El Amrani | Published in: International Journal of Computer Applications | Year: 2014	2014-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:_kc_bZDykSQC	f	3
88	Real-time access to orbital optical sensors for disaster early warning: A NATO science for peace sponsored partnership of universities in Morocco, Turkey and the USA	Enhancing the capacity of nations with respect to the early warning of disasters and the management of the sequellae of catastrophic events are essential components to regional sustainable development. The requisite infrastructure and trained personnel are both essential to providing early notification of disasters, such as storms, flooding, forest fires, hazardous chemical and oil spills and even epidemics, through identification and monitoring of infectious disease vector habitat. The need for such capacity building has been recognized by NATO’s Science for Peace program, resulting in the award of resources to install two real-time satellite remote sensing ground stations at selected institutions of higher learning in Morocco, Abdelmalek Essaadi University in Tangier and Al Akhawayn University in Ifrane. Partnering in this initiative are Bogazici University in Istanbul, Turkey, which has substantial disaster monitoring expertise; George Washington University’s High Performance Computing Lab in Washington, DC, USA and the United Nations GIS Center in Brindisi, Italy. The project, designated as the Mediterranean Dialogue Earth Observatory (MDEO), is being co-directed by Tuskegee University in Tuskegee, Alabama, USA, which has 130 years of experience in academic, scientific and agricultural higher education, research and engagement with countries within the African continent.	Authors: Gilbert L Rochon, Chaker El Amrani, Tajjeddine Rachidi, Tarek El Ghazawi, Gamal El Afandi, Joseph Essamuah-Quansah, Souleymane Fall, Gülay Altay, Mohammad A Mohammad | Year: 2013	2013-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:L8Ckcad2t8MC	f	3
89	System architecture of the mediterranean dialogue earth observatory	\N	Authors: Chaker El Amrani, Gilbert L Rochon, Tarek El-Ghazawi, Gülay Altay, Tajeddine Rachidi | Published in: 2013 IEEE International Geoscience and Remote Sensing Symposium-IGARSS | Year: 2013	2013-01-01	8	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:kNdYIx-mwKoC	f	3
90	Development of a real-time urban remote sensing initiative in the mediterranean region for early warning and mitigation of disasters	\N	Authors: Chaker El Amrani, Gilbert L Rochon, Tarek El-Ghazawi, Gülay Altay, Tajeddine Rachidi | Published in: 2012 IEEE International Geoscience and Remote Sensing Symposium | Year: 2012	2012-01-01	17	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:KlAtU1dfN6UC	f	3
91	Implementation of the WRF-Chem model in Grid Computing and GPU for regional air quality forecasting	\N	Authors: Chaker El Amrani, Ian M Hedgecock | Published in: 2012 IEEE International Geoscience and Remote Sensing Symposium | Year: 2012	2012-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:MXK_kJrjxJIC	f	3
92	A compartive study of cloud computing middleware	\N	Authors: Chaker El Amrani, Kaoutar Bahri Filali, Kaoutar Ben Ahmed, Amadou Tidiane Diallo, Stéphano Telolahy, Tarek El-Ghazawi | Published in: 2012 12th IEEE/ACM International Symposium on Cluster, Cloud and Grid Computing (ccgrid 2012) | Year: 2012	2012-01-01	20	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:zYLM7Y9cAGgC	f	3
93	Porting the WRF model to EumedGrid and simulation of air quality in urban zones	The main objective of this study is to simulate air quality in urban zones in Morocco, using WRF/Chem model, and Grid Computing technology. The World Health Organization defines air pollution as the contamination of the indoor or outdoor environment by any chemical, physical or biological agent that modifies the natural characteristics of the atmosphere [1].	Authors: Chaker El Amrani | Published in: International Symposium on Grids and Clouds (ISGC) | Year: 2012	2012-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:Y0pCki6q_DkC	f	3
94	Towards Setting up IBM Cloud Computing VCL at Abdelmalek Essaadi University	The need for adopting Cloud Computing in Morocco and the experience ongoing of VCL implementation at Abdelmalek Essaadi University are described in this paper. Students, Faculty and administrative staff can take great benefits from on-demand, flexible and real time services, provided by the IBM Cloud Computing initiative VCL. The installation process and configuration of VCL are ongoing. The next goal planed after completion is to export this experience to other Universities, and contribute accordingly to the establishment of Smarter Education in Morocco.	Authors: Chaker El Amrani, Hicham Gibet Tani, Lamiae Eloutouate | Published in: International Journal of Computer Applications | Year: 2012	2012-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:eQOLeE2rZwMC	f	3
95	State‐of‐the‐Art Technologies for Large‐Scale Computing	Resource providers in academia and commerce have started to offer access to their underutilized resources in an attempt to make better use of spare capacity. To enable this provision of free capacity to third parties, both kinds of provider require technologies to allow remote users restricted access to their local resources. Commonly employed technologies used to address this task are grid computing and cloud computing. This chapter provides an overview of grid computing and the architecture of grid middleware currently in use. After discussing the advantages and drawbacks of grid computing, the concept of virtualization is briefly introduced. Virtualization is a key concept behind cloud computing, which is described in detail in the chapter. The future and emerging synthesis of grid and cloud computing are also discussed. Today, modeling and simulation of large‐scale computing systems are considered as a …	Authors: Florian Feldhaus, Stefan Freitag, Chaker El Amrani | Published in: Large‐Scale Computing | Year: 2011	2011-01-01	14	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:7PzlFSSx8tAC	f	3
96	Grid activities in Morocco	\N	Authors: O Bouhali, C El Amrani, F Fassi, R Merrouch | Published in: Journal of Communication and Computer | Year: 10	0010-10-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:roLk4NBRz8UC	f	3
97	MaGrid: the Moroccan grid computing initiative	This initiative proved to be a catalyst for other Moroccan universities and research centers in the country with a growing interest to collaborate in Grid activities. Moreover the involvement of Morocco in the EumedGrid project, in the Mediterranean region, will open new collaboration efforts in terms of the Grid.	Authors: CHAKER El Amrani, Othmane Bouhali, Redouane Merrouch | Published in: IADIS International Journal on Computer Science and Information Systems | Year: 2	0002-02-01	7	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:4TOpqqG69KYC	f	3
99	Air2Day: An Air Quality Monitoring Adviser in Morocco	This article aims to present an end-to-end software solution capable of providing up to date weather and pollution values and health recommendations based on User profiles and personal health data, while making use of environmental satellite data processed in the back-end. this system demonstrates the possible range of applications of satellite-backed environmental systems that can assist and potentially replace the current expensive sensor-based systems, especially in developing countries in Africa.	Authors: Mohamed Akram Zaytar, Mohamed Amrani, Chaker El Amrani | Published in: International Journal of Computer Applications	\N	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:YsMSGLbcyi4C	f	3
100	CONTRIBUTION TO THE NEGOTIATION AND QOS OPTIMIZATION IN CLOUD COMPUTING FOR BIG DATA STORAGE AND PROCESSING	Cloud computing is a one of the leading technologies in distributed systems at the international level. This brand new computing model is based on the principle of on-demand services. By studying the Big Data storage and processing characteristics and the cloud computing new service delivery model radiates the importance of resources scheduling as a decisive feature, especially the compute resources scheduling. Until this moment, all platforms intended for cloud computing and big data are running on operating systems using scheduling algorithms that were designed on the past decade without the perception of the critical nature of these innovative paradigms. In our research work, a new scheduling algorithm design is considered for cloud computing and big data platforms that can help optimize the quality of service (QoS) in cloud computing and eventually leads to a perfect respect of the Service Level Agreement (SLA) between the provider and client.	Authors: GIBET TANI Hicham, EL AMRANI Chaker	\N	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=Qbl0uskAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=Qbl0uskAAAAJ:2osOgNQ5qMEC	t	3
101	Students performance clustering for future personalized in learning virtual reality	This study investigates five clustering algorithms—K-Means, Gaussian mixture model (GMM), hierarchical clustering (HC), k-medoids, and spectral clustering—applied to student performance in mathematics, reading, and writing to support the development of virtual reality (VR)-based adaptive learning systems. Cluster quality was assessed using Davies-Bouldin and Calinski-Harabasz indices. Spectral clustering achieved the best results (DBI= 0.75, CHI= 1322), followed by K-Means (DBI= 0.79, CHI= 1398), while HC demonstrated superior robustness to outliers. Three distinct student profiles—beginner, intermediate, and advanced—emerged, enabling targeted adaptive interventions. Supervised classifiers trained on these clusters reached up to 99% accuracy (logistic regression) and 97.5%(support vector machine (SVM)), validating the discovered groupings. This work introduces a novel, data-driven methodology integrating unsupervised clustering with supervised prediction, providing a practical framework for designing immersive VR learning environments.	Authors: Ghalia Mdaghri Alaoui, Abdelhamid Zouhair, Ilhame Khabbachi | Published in: International Journal of Electrical and Computer Engineering (IJECE) | Year: 2	0002-02-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:TQgYirikUcIC	f	4
102	Hybrid approach for tweets similarity classification founded on case based reasoning and machine learning techniques	Twitter sentiment analysis becomes a popular research subject in the last decade. It aims to extract sentiments of users through their public opinion about a given topic. This article proposes a hybrid approach for Twitter sentiment analysis founded on dynamic case based reasoning (DCBR), multinomial logistic regression machine learning algorithm and multi-agent system. Our approach proposes a method to find similar tweets based on content similarity measure using the scientific measurement of keyword weight term frequency-inverse document frequency (TF-IDF). This approach includes gathering and pre-processing tweets, getting score and polarity of tweets, the use of multinomial logistic regression machine learning algorithm to classify our tweets into various classes, using the feature extraction method to extract useful features and then the K-nearest neighbors (KNN) algorithm to make it easier to find similar tweets to our tweet target case. This approach is adaptive and generic and able to track users' tweet to predict their behavior and sentiments in critical situations and delivering personalized content. The current study focuses on Covid-19 tweets, and a public Twitter dataset is used for this purpose.	Authors: Ismail Bensassi, Mohamed Kouissi, Oussama Ndama, El Mokhtar En-Naimi, Abdelhamid Zouhair | Published in: Bulletin of Electrical Engineering and Informatics | Year: 2025	2025-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:hFOr9nPyWt4C	f	4
103	A cheating detection system in online exams through real-time facial emotion recognition of students	\N	Authors: Ilhame Khabbachi, Ghalia Mdaghri-Alaoui, Abdelhamid Zouhair, Aziz Mahboub | Published in: 2024 International Conference on Computing, Internet of Things and Microwave Systems (ICCIMS) | Year: 2024	2024-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:-f6ydRqryjwC	f	4
104	Exploring learner achievement analysis using K-means, SVM, and EM clustering in a Unity-based virtual reality learning environment	\N	Authors: Ghalia Mdaghri-Alaoui, Ilhame Khabbachi, Abdelhamid Zouhair, El Mokhtar En-Naimi | Published in: 2024 International Conference on Computing, Internet of Things and Microwave Systems (ICCIMS) | Year: 2024	2024-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:hC7cP41nSMkC	f	4
105	Enhancing Learning Through the Unity Virtual Reality Platform: Analyzing and Classifying Learner Profiles	This article examines the impact of integrating virtual reality (VR) into learning environments, focusing on using the Unity platform. We explore how virtual reality offers unique opportunities to engage students and enhance learning through immersive and interactive environments. Additionally, we explore combining virtual reality and machine learning to analyze data generated by learners interacting with the Unity platform. A central aspect of our research is collecting data on learner performance in VR environments, with a focus on exporting student performance from Unity into compatible formats such as Excel. Using this data, we apply clustering algorithms, including K-Means, Ascending Hierarchy classification (HAC), and Expectation Maximization (EM), to classify learners based on their ability level, whether they are beginner, intermediate, or advanced. By analyzing the results of these algorithms, we conclude …	Authors: Ghalia Mdaghri-Alaoui, Abdelhamid Zouhair, El Mokhtar En-Naimi | Published in: International Conference On Big Data and Internet of Things | Year: 2024	2024-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:HDshCWvjkbEC	f	4
106	Using Deep Learning to Detect Cheating on TCExam Platform Through Real-Time Facial Emotion Recognition	Since the spread of the Covid-19 pandemic and its impact on the normal education process worldwide, including the conduct of exams, the education sector has had to shift from traditional in-person teaching to remote learning. This shift has led education authorities to confront the challenge of cheating in online exams and to seek reliable solutions to ensure fair exam conduct in an online environment. Our solution, based on machine learning techniques and artificial neural networks, aims to detect cheating cases in an online exam through facial emotion recognition exhibited by students during the online exam on the TCExam platform.	Authors: Ilhame Khabbachi, Abdelhamid Zouhair, Aziz Mahboub | Published in: International Conference On Big Data and Internet of Things | Year: 2024	2024-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:mB3voiENLucC	f	4
107	Sentiment Analysis Based on Machine Learning Algorithms: Application to Amazon Product Reviews	Sentiment analysis plays a crucial role in understanding customers’ opinions and sentiments towards products, making it valuable for businesses to make informed decisions. In this article, we present a comprehensive comparative analysis of sentiment analysis techniques applied to Amazon product reviews. Specifically, we employ three popular machine learning algorithms: Logistic Regression, Support Vector Machines (SVM), and Random Forest. Our study focuses on evaluating the performance of these algorithms in terms of accuracy, precision, recall, and F1 score for sentiment classification. We utilize a carefully curated dataset of Amazon product reviews, covering a diverse range of products and customer sentiments. Through extensive experimentation and analysis, we compare the strengths and weaknesses of each algorithm in capturing sentiment information from the reviews. The findings of our study …	Authors: El Rharroubi Mohamed Amine, Abdelhamid Zouhair | Published in: The International Conference on Artificial Intelligence and Smart Environment | Year: 2023	2023-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:IWHjjKOFINEC	f	4
108	A Comparative Analysis of Deep Learning Approaches for Enhancing Security in Web Applications	This paper provides a comparative analysis of deep learning algorithms for detecting web attacks and code vulnerability, A review of the literature highlights the methodologies, datasets used, achieved accuracies of these models and their limitations. By understanding web attacks and leveraging advanced technologies, it is possible to enhance the security and protection of digital assets. A notable observation is the underutilization of resources to protect JavaScript, a widely used programming language on the internet. To address this gap, our research prioritizes improving JavaScript’s security. We aim to develop a system that improve web application protection, ensuring a safer online environment for users.	Authors: Hamza Kadar, Abdelhamid Zouhair | Published in: The Proceedings of the International Conference on Smart City Applications | Year: 2023	2023-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:qUcmZB5y_30C	f	4
109	An intelligent solution based on a multi-agent system for the detection of cheating in online exams	Given the extreme necessity of the process of distance teaching and online learning as flexible and sustainable solutions to some major challenges in university institutions in various countries around the world, including the importance of allowing students to take exams remotely under appropriate conditions similar to those in normal in-person teaching situations, this article focuses on studying a group of online exam platforms, including learning management system platforms that enable exam creation and management, as well as monitoring software. The choice of platform depends on several criteria; the platform must be open source, reliable, and allow for the integration of other tools and software. Our work is focused on an intelligent architecture that aims to detect cheating in online exams by adopting the technique of tracking students' movements throughout the exam period. Thus, the solution we propose is …	Authors: Ilhame Khabbachi, Abdelhamid Zouhair, Aziz Mahboub | Published in: Proceedings of the 6th international conference on networking, intelligent …, 2023 | Year: 2023	2023-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:ZeXyd9-uunAC	f	4
110	Review of Vulnerabilities and Countermeasures Against Sybil Attacks on Decentralized Systems Based on Machine Learning Algorithms	The Sybil assault is one example of a sort of attack that targets distributed systems and uses numerous identities to influence network behavior. In numerous distributed systems, including peer-to-peer networks, social networks, and blockchain networks, Sybil attacks have been used. The current paper summarizes the pertinent studies on Sybil attacks, discusses how to avoid them, and offers potential countermeasures to Sybil attacks. The solutions are divided into two groups: those relying on machine learning and those not. The study concludes by highlighting the importance of understanding how to defend against Sybil assaults and providing insightful information on the numerous aspects affecting vulnerable systems.	Authors: Abdellatif Bakar, Abdelhamid Zouhair, El Mokhtar En-Naimi | Published in: Proceedings of the 6th International Conference on Networking, Intelligent Systems & Security | Year: 2023	2023-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:L8Ckcad2t8MC	f	4
111	Tweets similarity classification based on machine learning algorithms, TF-IDF and the dynamic case based reasoning	The research on the field of Twitter sentiment analysis, which aims to extract users’ sentiments through their public opinion about a given topic, has been increased and grown rapidly across a broad range of disciplines in the last decade. In this article, we propose a hybrid approach for Tweets similarity classification Based on Dynamic Case Based Reasoning approach, machine learning algorithms and Multi-Agent System. Our approach proposes a multi-agent adaptive system for Tweets similarity classification. It combines the Dynamic Case-Based Reasoning approach with the scientific measurement of keyword weight (Term Frequency- Inverse Document Frequency, TF-IDF). It consists of gathering and pre-processing tweets about a given topic and use a feature extraction to extract useful features. Machine Learning algorithms are then used for similarity content-based classification. Our approach is general and …	Authors: Mohamed Kouissi, El Mokhtar En-Naimi, Abdelhamid Zouhair | Published in: Proceedings of the 6th International Conference on Networking, Intelligent Systems & Security | Year: 2023	2023-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:7PzlFSSx8tAC	f	4
112	Employing multi-agent systems to enhance virtual reality platforms	The use of virtual reality technology in the classroom has the potential to transform the way students learn by fostering immersive and interesting learning experiences that let them explore, discover, and build their own knowledge by giving students realistic and interactive experiences, virtual reality can dramatically influence distance learning. This technology has a positive effect on education. In addition, several research articles show that this technology has a positive impact on the user experience of learners. This paper presents some different virtual reality platforms used in different filed, specifically education. Additionally, there are systems that enable the complete integration of two increasingly important areas: virtual reality for visualization and intelligent multi-agent systems for artificial intelligence. The main goal of this paper is to propose an architecture for our system based on a multi-agent system with …	Authors: Ghalia Mdaghri-Alaoui, Abdelhamid Zouhair, Nihad Elghouch | Published in: Proceedings of the 6th International Conference on Networking, Intelligent …, 2023 | Year: 2023	2023-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:dhFuZR0502QC	f	4
113	Reduce cheating in e-exams using machine learning: state of the art	Cheating on online exams becomes a black spot in distance learning environments. On the one hand, it threatens the credibility of these exams by violating the principle of equality and success on merit. On the other hand, it also has negative repercussions on the reputation of the institutions. Without a doubt, in the Covid-19 health crisis and following the recommendations of the World Health Organization to respect social distancing, the majority of establishments have adopted the distance learning system, including online exams. However, the difficulty of monitoring learner activity in remote settings characterizes this type of assessment by inequity. In practice, each establishment has relied on a monitoring solution adapted according to certain criteria in order to guarantee a fair passage of the exams and to control them well. AI-assisted proctoring tools add a layer of protection to online exams. In this article we will …	Authors: Ilhame Khabbachi, Abdelhamid Zouhair, Aziz Mahboub, Nihad Elghouch | Published in: International Conference On Big Data and Internet of Things, 225-238, 2022 | Year: 2022	2022-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:QIV2ME_5wuYC	f	4
114	Virtual Reality Based on Machine Learning: State of the Art	The use of machine learning techniques has exploded in recent years as well as the use of virtual reality techniques it’s can be used in many fields such as medicine, entertainment, education, military, etc. Machine learning visualization can be extended to virtual reality. For machine learning, data visualization is important. In addition, virtual reality can use machine learning to visualize digital educational simulations in three dimensions. Virtual reality transforms the learning process from passive to active, allowing users to engage with the material and apply what they have learned in a real-world setting. Using machine learning, we can design motion interaction systems with motion examples rather than coding, we design interactions by moving. This can make it possible to design much more natural interactions. In this article, we will discuss the contribution of machine learning to virtual reality, and compare the …	Authors: Ghalia Mdaghri-Alaoui, Abdelhamid Zouhair, El Mokhtar En-Naimi, Nihad Elghouch, Aziz Mahboub | Published in: International Conference On Big Data and Internet of Things, 501-512, 2022 | Year: 2022	2022-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:9ZlFYXVOiuMC	f	4
115	An Overview on Machine Learning Approach to Secure the Blockchain	As a part of artificial intelligence, machine learning has been widely used in recent research to solve problems such as classification, clustering, and regression, using different approaches.	Authors: Abdellatif Bakar, Abdelhamid Zouhair, El Mokhtar En-Naimi | Published in: International Conference On Big Data and Internet of Things, 486-500, 2022 | Year: 2022	2022-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:mVmsd5A6BfQC	f	4
116	Hybrid Approach for Wind Turbines Power Curve Modeling Founded on Multi-Agent System and Two Machine Learning Algorithms, K-Means Method and the K-Nearest Neighbors, in the …	Wind turbine power curve (WTPC) plays an important role for energy assessment, power forecasting and condition monitoring. The WTPC captures the nonlinear relationship between wind speed and output power. Many modeling approaches have been proposed by researches to improve the WTPC model performance. In this paper, we present a hybrid approach of wind turbines power curve modeling based on Case Based Reasoning approach, multi agent system, the K-Means unsupervised machine learning method, and then the supervised machine learning algorithm, which is the K-Nearest Neighbors KNN method. The both of the Machine Learning algorithms, K-means and KNN, are used in the retrieve step of the Dynamic Case Based Reasoning (DCBR) cycle to facilitate the search of wind turbines with similar characteristics to our target case. These wind turbines are first grouped into homogeneous …	Authors: Mohamed Kouissi, El Mokhtar En-Naimi, Abdelhamid Zouhair | Published in: International Journal of Online & Biomedical Engineering | Year: 2022	2022-01-01	6	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:Wp0gIr-vW9MC	f	4
117	Hybrid approach of the fuzzy C-means and the K-nearest neighbors methods during the retrieve phase of dynamic case based reasoning for personalized follow-up of learners in …	The goal of adaptive learning systems is to help the learner achieve their goals and guide their learning. These systems make it possible to adapt the presentation of learning resources according to learners' needs, characteristics and learning styles, by offering them personalized courses. We propose an approach to an adaptive learning system that takes into account the initial learning profile based on Felder Silverman's learning style model in order to propose an initial learning path and the dynamic change of his behavior during the learning process using the Incremental Dynamic Case Based Reasoning approach to monitor and control its behavior in real time, based on the successful experiences of other learners, to personalize the learning. These learner experiences are grouped into homogeneous classes at the behavioral level, using the Fuzzy C-Means unsupervised machine learning method to facilitate …	Authors: El Ghouch Nihad, En-Naimi El Mokhtar, Zouhair Abdelhamid, Al Achhab Mohammed | Published in: International Journal of Electrical & Computer Engineering | Year: 12	0012-12-01	21	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:M3ejUd6NZC8C	f	4
118	A New Approach for Search Engine Optimization based Case Based Reasoning to detect user's intent	The main objective of the Search Engine Optimization is to understand the user's query / user's intent. Our goal is to provide the optimal result for each user's query in order to adapt the content to user profile. To overcome this challenge involves first, to understanding the search intentions of internet user's and paramount to the search engines and in the second way, to understand the traffic behavior for each user. This can be accomplished by defining the type of content to be produced in order to maximize your chances of positioning yourself, and the use of the traces user's, which include chronology of interactions and productions left by the user during his navigation process.	Authors: Abdelhamid Zouhair, Salma Gaou, En-Naimi El Mokhtar, Pedro A Castillo-Valdivieso, Cyrille Bertelle | Published in: Proceedings of the 4th International Conference on Big Data and Internet of Things | Year: 2019	2019-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:4TOpqqG69KYC	f	4
119	Individualized follow-up of the learner based on the K-nearest neighbors (K-NN) method embedded in the retrieval step of case based reasoning approach (CBR)	Learner follow-up in adaptive learning systems requires real-time decision support approaches, using algorithms to predict learner behavior based on the experiences of other learners (learners already classified in groups). We propose an adaptive learning system architecture using the Felder-Silverman learning style model to detect the initial learning profile for each learner in order to provide a learning path based on his profile and the Incremental Dynamic Case Based Reasoning approach based on the exploitation of learning traces in order to follow and to control the behavior of the learner in an automatic and real-time way through the search for similar past experiences using the K-Nearest Neighbors algorithm.	Authors: Nihad El Ghouch, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohammed Al Achhab | Published in: The Proceedings of the Third International Conference on Smart City Applications | Year: 2018	2018-01-01	4	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:Zph67rFs4hoC	f	4
120	Designing and developing multi-agent systems for management of common renewable resources	In this paper, we present a new approach of design and developing multi agent systems. Our approach is based on Model Driven Architecture (MDA), which aims to establish the link between existing agent architectures and the models or meta-models of multi-agent systems that we build from AUML. We have designed a generic and scalable class diagram to develop complex multi-agent systems. The source code of the models is generated by an open source tool called AndroMDA [Elallaoui et al. in Automated model briven testing using AndroMDA and UML2 testing profile in scrum process. Procedia Comput. Sci. 83, 221–228,  2016, ]. The model and source code will facilitate the design and development of applications to implement and simulate multi-agent models for Management of Common Renewable Resources. This approach allows reuse of the model and generated source code to develop new …	Authors: Mohamed Kouissi, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohammed Al Achhab | Published in: The Proceedings of the Third International Conference on Smart City Applications | Year: 2018	2018-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:KlAtU1dfN6UC	f	4
121	New Approach of Designing and Developing Multi-Agent Systems	In this paper, we present a new approach of design and developing multi agent systems. Our approach is based on Model Driven Architecture (MDA), which aims to establish the link between existing agent architectures and the models or meta-models of multi-agent systems that we build from AUML. We have designed a generic and scalable class diagram to develop complex multi-agent systems. The source code of the models is generated by an open source tool called AndroMDA. The model and source code will facilitate the design and development of applications to implement and simulate multi-agent models for Management of Common Renewable Resources. This approach allows reuse of the model and generated source code to develop new applications.	Authors: Mohamed Kouissi, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohammed Al Achhab | Published in: Proceedings of the 3rd International Conference on Smart City Applications | Year: 2018	2018-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:3fE2CSJIrl8C	f	4
122	Guided retrieve through the K-nearest neighbors method in adaptive learning system using the dynamic case based reasoning approach	The goal of adaptive learning systems is to find ways to adapt learning. There are already adaptation techniques that relate to presentation, content and navigation, but they do not make it possible to dynamically create a personalized path and to carry out an individualized follow-up of each learner by reducing the risk of failure and abandonment. We propose architecture of an adaptive learning system based on Incremental Dynamic Case Based Reasoning to provide a personalized real-time learning according to the profile of each learner and the experiences of other learners and on the K-Nearest Neighbors method to facilitate the research and classification of learners with similar behaviors, as well as to predict future behaviors.	Authors: Nihad El Ghouch, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohammed Al Achhab | Published in: Proceedings of the 3rd International Conference on Smart City Applications | Year: 2018	2018-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:MXK_kJrjxJIC	f	4
123	Our architecture of an adaptive learning system based on the dynamic case-based reasoning and the learner traces	The adaptation of the Computing Environment for Human Learning allows adapting the process of learning to needs, to rhythms of every learner, to styles of learning and to preferences, but they do not guarantee an individualized real time follow-up, by favoring the learning of a domain of the acquisition of the knowledge by a learner.	Authors: Nihad El Ghouch, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohamed Al Achhab | Published in: Proceedings of the 2nd International Conference on Computing and Wireless Communication Systems | Year: 2017	2017-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:5nxA0vEk-isC	f	4
124	Using the CBR dynamic method to correct the generates learning path in the adaptive learning system	The adaptive learning systems have the capacity to adapt the learning process to the needs/the rhythms of each learner, the learning styles and the preferences, but they do not ensure an individualized follow-up in real time. In this article, we will present our architecture of an Adaptive Learning System using Dynamic Case-Based Reasoning. This architecture is based on the learning styles of Felder-Silverman and the Bayesian Network to propose the learning path according to the adaptive style and on the other hand on the approach of the Dynamic Case-Based Reasoning to ensure a prediction of the dynamic situation during the learning process, when the learner has difficulty learning. This approach is based on the reuse of past similar experiences of learning (learning path) by analyzing learners’ traces.	Authors: Nihad El Ghouch, El Mokhtar En-Naimi, Abdelhamid Zouhair, Mohammed Al Achhab | Published in: Proceedings of the Mediterranean Symposium on Smart City Applications | Year: 2017	2017-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:8k81kl-MbHgC	f	4
125	Search Engine Optimization to detect user's intent	The major evolution of the search engine is to understand the user's query and user's intent. The other size change and you all know, is the evolution of the mobile query. Indeed, research on search engines is trying today to bring results of research adapted to the intent of the user. Understanding the search intentions of internet users and paramount to the search engines. But it is also for SEO. By understanding the user's intention to search, we can define the type of content to be produced in order to maximize your chances of positioning yourself.	Authors: Salma Gaou, Aissam Bekkari, Marouane El Mabrouk, Abdelhamid Zouhair | Published in: Proceedings of the 2nd international Conference on Big Data, Cloud and Applications | Year: 2017	2017-01-01	5	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:0EnyYjriUFMC	f	4
126	Search Engine Optimization to detect user's intent	\N	Authors: Abdelhamid Zouhair Salma Gaou, Aissam Bekkari, Marouane El Mabrouk | Published in: BDCA'17 Proceedings of the 2nd international Conference on Big Data, Cloud and Applications Article No. 41 | Year: 3	0003-03-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:kNdYIx-mwKoC	f	4
127	Big incremental dynamic case-based reasoning-multi-agents system (BIDCBR-MAS) based on cloud computing	\N	Authors: Abdelhamid Zouhair | Published in: 2016 4th IEEE International Colloquium on Information Science and Technology (CiSt) | Year: 2016	2016-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:LkGwnXOMwfcC	f	4
128	Intelligent dynamic case-based reasoning using multi-agents system in adaptive e-service, e-commerce and e-learning systems	In this paper, we present our approach in the field of case-based reasoning (CBR). This approach is based on the reuse of previous traces that are similar to the current situation in a dynamic way. Several approaches have been used in this area, but they suffer from some limitations in automated real-time management dynamic parameters. We propose a generic approach multi-agent multi-layer able to learn automatically from their experiences. This approach involves (1) the use of incremental dynamic case-based reasoning (IDCBR) able to study dynamic situations (recognition, prediction and learning situations); (2) the use of multi-agents system and (3) the use of the user traces. When interacting with the platform such as e-service, e-learning, e-business and e-commerce, every user leaves his or her traces in the machine. The traces are stored in database, this operation enriches collective past experiences …	Authors: El Mokhtar En-Naimi, Abdelhamid Zouhair | Published in: International Journal of Knowledge and Learning | Year: 2016	2016-01-01	21	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:_FxGoFyzp5QC	f	4
129	Incremental dynamic case-based reasoning-MAS: From static to dynamic cycle	\N	Authors: Abdelhamid Zouhair | Published in: 2015 5th International Conference on Information & Communication Technology and Accessibility (ICTA) | Year: 2015	2015-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:WF5omc3nYNoC	f	4
130	Raisonnement à partir de cas dynamique multi-agents-Application à un système de tuteur intelligent	\N	Authors: Zouhair Abdelhamid | Published in: Université AbdelMalek Essaadi, Faculté des Sciences et Techniques, Tanger, 2014 | Year: 2014	2014-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:roLk4NBRz8UC	f	4
131	The impact of the implementation of our system IDCBR-MAS	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 2014 Third IEEE International Colloquium in Information Science and Technology (CIST) | Year: 2014	2014-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:YsMSGLbcyi4C	f	4
132	Modelisation and implementation of our system incremental dynamic case based reasoning founded In the MAS under JADE plate-form	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 2014 International Conference on Multimedia Computing and Systems (ICMCS) | Year: 2014	2014-01-01	6	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:Y0pCki6q_DkC	f	4
133	Raisonnement à Partir de cas dynamique multi-agents: application à un système de tuteur intelligent	\N	Authors: Abdelhamid Zouhair | Year: 2014	2014-01-01	20	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:W7OEmFMy1HYC	f	4
134	Our System IDCBR-MAS: from the Modelisation by AUML to the Implementation under JADE Platform	\N	Authors: Abdelhamid Zouhair, El Mokhtar En-Naimi, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: International Journal of Interactive Multimedia and Artificial Intelligence …, 2014 | Year: 2014	2014-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:zYLM7Y9cAGgC	f	4
135	Intelligent tutoring systems founded of incremental dynamic case based reasoning and multi-agent systems (its-idcbr-mas)	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 2013 International Conference on Advanced Logistics and Transport | Year: 2013	2013-01-01	8	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:UeHWp8X0CEIC	f	4
136	Incremental Dynamic Case Based Reasoning and Multi-Agent Systems (IDCBR-MAS) for Intelligent Tutoring System	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: International Journal of Advanced Research in Computer Science and Software Engineering | Year: 2013	2013-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:YOwf2qJgpHMC	f	4
137	Dynamic case-based reasoning based on the multi-agent systems: Individualized follow-up of learners in distance learning	In a Computing Environment for Human Learning (CEHL), there is still the problem of knowing how to ensure an individualized and continuous learner’s follow-up during learning process, indeed among the numerous methods proposed, very few systems concentrate on a real time learner’s followup. Our work in this field develops the design and implementation of a Multi-Agent Systems Based on Dynamic Case Based Reasoning which can initiate learning and provide an individualized follow-up of learner. When interacting with the platform, every learner leaves his/her traces in the machine. These traces are stored in a basis under the form of scenarios which enrich collective past experience. The system monitors, compares and analyses these traces to keep a constant intelligent watch and therefore detect difficulties hindering progress and avoid possible dropping out. The system can support any learning …	Authors: Abdelhamid Zouhair, El Mokhtar En-Naimi, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: Intelligent Distributed Computing VI: Proceedings of the 6th International Symposium on Intelligent Distributed Computing-IDC 2012, Calabria, Italy, September 2012 | Year: 2013	2013-01-01	1	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:qjMakFHDy7sC	f	4
138	Intelligent Tutoring Systems Based on the Multi-Agent Systems (ITS-MAS): The Dynamic and Incremental Case Based Reasoning (DICBR) Paradigm and the Inverse Longest Common Sub …	The major problem of e-learning is often stopped during training. Due to the fact that it is necessary to ensure an individualized and continuous learner’s follow-up during the learning process. Our work in this field develops the design and implementation of a Multi-Agents System Based on Dynamic Case Based Reasoning which can initiate learning and provide an individualized follow-up of a learner. When interacting with the platform, every learner leaves his/her traces in the machine. These traces are stored in the memory bank, this operation enriches collective past experiences. Via monitoring, comparing and analyzing these traces, the system keeps a constant intelligent watch on the platform, and therefore it detects the difficulties hindering progress, and/or it avoids possible dropping out. The system can support any learning subject. The success of a casebased reasoning system depends critically on the performance of the retrieval step used and, more particularly, on similarity measure used to retrieve source cases that are similar to the learners' traces (traces in progress). We propose a dynamic retrieving method based on a complementary similarity measure, named Inverse Longest Common Sub-Sequence (ILCSS). To guide and help the learner, the system is equipped with combination of human and virtual tutors.	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: International Journal of Computer Science Issues (IJCSI) | Year: 2012	2012-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:Se3iqnhoufwC	f	4
139	Intelligent tutoring systems founded on the multi-agent incremental dynamic case based reasoning	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 2012 Colloquium in Information Science and Technology | Year: 2012	2012-01-01	10	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:u5HHmVD_uO8C	f	4
140	Multi-Agents Dynamic Case Based Reasoning and The Inverse Longest Common Sub-Sequence And Individualized Follow-up of Learners in The CEHL	\N	Authors: Abdelhamid Zouhair, El Mokhtar En-Naimi, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: arXiv preprint arXiv:1209.6395 | Year: 2012	2012-01-01	3	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:2osOgNQ5qMEC	f	4
141	Intelligent Tutoring Systems Based on the Multi-Agent Systems(ITS-MAS): The Dynamic and Incremental Case Based Reasoning(DICBR) Paradigm and the Inverse Longest Common Sub …	\N	Authors: El Mokhtar En-Naimi, Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: International Journal of Computer Science Issues(IJCSI) | Year: 2012	2012-01-01	11	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:_kc_bZDykSQC	f	4
142	Individualized follow-up of learners based on multi-agent case-based reasoning in distance learning	Environment for Human Learning (CEHL), there is still the problem of knowing how to ensure an individualized and continuous learner’s follow-up during learning process, indeed among the numerous methods proposed, very few systems concentrate on a real time learner’s follow-up. Our work in this field develops the design and implementation of a Multi-Agent System based on dynamic case based reasoning which can initiate learning and provide an individualized monitoring of learner/trainee. When interacting with the platform, every learner/trainee leaves his/her traces in the machine. These traces are stored in a basis under the form of scenarios which enrich collective past experience. The system monitors, compares and analyses these traces to keep a constant intelligent watch and therefore detect difficulties hindering progress and/or avoid possible dropping out. The system can support any learning subject. To help and guide the learner, the system is equipped with combined virtual and human tutors.	Authors: Abdelhamid Zouhair, EM En-Naimi, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: The International Journal IJICT | Year: 11	0011-11-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:ufrVoPGSRksC	f	4
143	Multiagent case-based reasoning and individualized follow-up of learner in remote learning	\N	Authors: Abdelhamid Zouhair, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 2011 International Conference on Multimedia Computing and Systems | Year: 2011	2011-01-01	5	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:u-x6o8ySG0sC	f	4
144	Raisonnement à partir de cas et suivi individualisé de l’apprenant en apprentissage à distance	\N	Authors: Abdelhamid Zouhair, En-Naimi El Mokhtar, Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: 7ème colloque international Telecom & JFMMA | Year: 2011	2011-01-01	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:4DMP91E08xMC	f	4
145	Une architecture multiagents multicouches pour une adaptation pédagogique d ‘apprentissage à distance	Des avancées ont été réalisées au cours de ces dernières années dans le domaine du elearning. Mais les fonctionnalités associées à l’adaptation d’apprentissage selon le niveau et les capacités de l’apprenant sont encore insuffisantes, voire non efficaces. Notre travail se situe dans ce contexte. Il consiste à concevoir et à mettre en place un système informatique adaptatif capable d’initier l’apprentissage et d’assurer un suivi individualisé de l’apprenant, ce suivi est fondé sur des cas (d’abandon, de difficultés). Notre approche se base sur l’analyse du parcours de l’apprenant. Le système permet de représenter, suivre et analyser l’évolution d’une situation d’apprentissage afin d’anticiper un éventuel abandon de l’apprenant ou une démotivation de celui-ci. Ce système s’ appuie sur le rapprochement entre le parcours de l’apprenant et des parcours (traces) passés. Les traces passées sont stockées sous la forme de scénarios dans une base dite «base de scénarii». L’analyse du parcours doit se faire de manière continue, et en temps réel ce qui nous amène à choisir une architecture MultiAgent permettant la mise en œuvre d’un raisonnement à partir de cas dynamique. Le système est en outre ouvert et générique pour supporter n’importe quel objet d’apprentissage. Ce système propose un tuteur virtuel, associé à un tuteur humain dans le cadre d’un enseignement hybride.	Authors: Abdelhamid Zouhair, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle | Published in: Juin, 2010 | Year: 2010	2010-01-01	2	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:9yKSN-GCB0IC	f	4
146	IDCBR-MAS	Intelligent Tutoring System (ITS), in fact the risk of dropping out for learners have emerged as crucial issues to be solved. So it is necessary to ensure an individualized and continuous learner’s follow-up during learning process. Several research effort has been spent on the development of ITS. However the available literature does not generally concentrate on the individual realtime continuous follow up of learners. Our contribution in this field is to design and implement a computer system able to initiate learning and provide an individualized monitoring of learners. This approach involves 1) the use of Dynamic Case Based Reasoning to retrieve the past experiences that are similar to the learners' traces (traces in progress), and 2) the use of Multi-Agents System. Our Work focuses on the use of the learner traces. When interacting with the platform, every learner leaves his/her traces in the machine. The traces are stored in database, this operation enriches collective past experiences. Via monitoring, comparing and analyzing these traces, the system keeps a constant intelligent watch on the platform, and therefore it detects the difficulties hindering progress, and it avoids possible dropping out. The system can support any learning subject.	Authors: Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle	\N	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:hqOjcs7Dif8C	f	4
147	Modelisation and Implementation of our System Incremental Dynamic Case Based Reasoning founded In the MAS under JADE Plate-Form	The aim of this paper is to present our approach in the field of Intelligent Tutoring System (ITS), in fact there is still the problem of knowing how to ensure an individualized and continuous learners follow-up during learning process, indeed among the numerous methods proposed, very few systems concentrate on a real time learners follow-up. Our contribution in these areas is to design and develop an adaptive Multi-Agent Systems Based on Dynamic Case Based Reasoning which can initiate learning and provide an individualized follow-up of learner. This approach involves 1) the use of Dynamic Case Based Reasoning to retrieve the past experiences that are similar to the learner’s traces, and 2) the use of Multi-Agents System.	Authors: Benaissa Amami, Hadhoum Boukachour, Patrick Person, Cyrille Bertelle	\N	0	https://scholar.google.com/citations?view_op=view_citation&hl=en&user=3RA5IZkAAAAJ&pagesize=100&sortby=pubdate&citation_for_view=3RA5IZkAAAAJ:UebtZRa9Y70C	t	4
\.


--
-- TOC entry 5157 (class 0 OID 32036)
-- Dependencies: 264
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reactions (id, type, "timestamp", "postId", "userId", "commentId") FROM stdin;
19	LIKE	2026-03-05 22:54:24.01984	4	5	\N
21	LIKE	2026-03-05 22:57:12.900257	20	5	\N
23	LIKE	2026-03-05 23:16:57.899968	15	4	\N
27	LIKE	2026-03-05 23:31:06.314522	4	4	\N
26	LIKE	2026-03-06 00:12:08.924362	21	4	\N
11	LIKE	2026-03-06 19:56:57.555962	15	5	\N
28	LOVE	2026-03-10 19:47:29.851111	21	5	\N
\.


--
-- TOC entry 5160 (class 0 OID 32087)
-- Dependencies: 267
-- Data for Name: scopus_integrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scopus_integrations (id, "scopusAuthorId", "profileUrl", "lastSynced", "userId") FROM stdin;
2	56600759300	https://www.scopus.com/authid/detail.uri?authorId=56600759300	2026-02-11	6
\.


--
-- TOC entry 5162 (class 0 OID 32105)
-- Dependencies: 269
-- Data for Name: scopus_publications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scopus_publications (id, title, abstract, summary, "publicationDate", "citationCount", "scopusUrl", "isPosted", "scopusIntegrationId") FROM stdin;
26	Towards a new platform based on learning outcomes analysis for mobile serious games	\N	Authors: Lotfi E. | Published in: International Journal of Emerging Technologies in Learning | Year: 2020	2020-01-01	12	https://www.scopus.com/record/display.uri?eid=2-s2.0-85090795058	f	2
28	Teaching object oriented programming concepts through a mobile serious game	\N	Authors: Lotfi E. | Published in: ACM International Conference Proceeding Series | Year: 2018	2018-10-10	5	https://www.scopus.com/record/display.uri?eid=2-s2.0-85059883290	f	2
29	Advancing Financial Modeling: Integrating Copulas and Deep Learning for Enhanced Risk Management and Derivative Pricing	\N	Authors: Ahnouch M. | Published in: Lecture Notes in Information Systems and Organisation | Year: 2024	2024-01-01	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-85211948170	f	2
30	Non-Uniqueness of Best-Of Option Prices Under Basket Calibration	\N	Authors: Ahnouch M. | Published in: Risks | Year: 2025	2025-06-01	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-105009314367	f	2
31	A digital revolution in Nursing Education - The serious games	\N	Authors: Elaachak L. | Published in: International Conference on Multimedia Computing and Systems Proceedings | Year: 2017	2017-04-19	3	https://www.scopus.com/record/display.uri?eid=2-s2.0-85019135247	f	2
32	Current Trends in AI-Based Derivatives Pricing: A Review	\N	Authors: Ahnouch M. | Published in: ACM International Conference Proceeding Series | Year: 2023	2023-05-24	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-85180131747	f	2
33	Classification of Malicious and Benign Binaries Using Visualization Technique and Machine Learning Algorithms	\N	Authors: Ben Abdel Ouahab I. | Published in: Studies in Computational Intelligence | Year: 2022	2022-01-01	3	https://www.scopus.com/record/display.uri?eid=2-s2.0-85123434268	f	2
34	Comparative study of neural networks algorithms for cloud computing CPU scheduling	\N	Authors: Hicham G.T. | Published in: International Journal of Electrical and Computer Engineering | Year: 2017	2017-12-01	21	https://www.scopus.com/record/display.uri?eid=2-s2.0-85032221841	f	2
35	Towards a system of guidance, assistance and learning analytics based on multi agent system applied on serious games	\N	Authors: Elaachak L. | Published in: International Journal of Electrical and Computer Engineering | Year: 2015	2015-04-01	16	https://www.scopus.com/record/display.uri?eid=2-s2.0-84928158635	f	2
36	Reinforcement Learning Algorithms and Their Applications in Education Field: A Systematic Review	\N	Authors: Gharbi H. | Published in: Lecture Notes in Networks and Systems | Year: 2024	2024-01-01	2	https://www.scopus.com/record/display.uri?eid=2-s2.0-85189631929	f	2
37	Deep learning based Arabic short answer grading in serious games	\N	Authors: Soulimani Y.A. | Published in: International Journal of Electrical and Computer Engineering | Year: 2024	2024-02-01	3	https://www.scopus.com/record/display.uri?eid=2-s2.0-85183669400	f	2
38	Finetuning Stable Diffusion Models for Email Marketing Text-to-Image Generation	\N	Authors: Loukili S. | Published in: Lecture Notes in Networks and Systems | Year: 2025	2025-01-01	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-105005394795	f	2
39	Image-Based Malware Classification Using Multi-layer Perceptron	\N	Authors: Ben Abdel Ouahab I. | Published in: Smart Innovation Systems and Technologies | Year: 2022	2022-01-01	8	https://www.scopus.com/record/display.uri?eid=2-s2.0-85116889192	f	2
40	Model Risk in Financial Derivatives and The Transformative Impact of Deep Learning: A Systematic Review	\N	Authors: Ahnouch M. | Published in: Lecture Notes in Networks and Systems | Year: 2024	2024-01-01	1	https://www.scopus.com/record/display.uri?eid=2-s2.0-85189607173	f	2
41	A comparative study of augmented reality SDKs to develop an educational application in chemical field	\N	Authors: Hanafi A. | Published in: ACM International Conference Proceeding Series | Year: 2019	2019-01-01	10	https://www.scopus.com/record/display.uri?eid=2-s2.0-85066615616	f	2
42	Assessment-driven Learning through Serious Games: Guidance and Effective Outcomes	\N	Authors: Yedri O.B. | Published in: International Journal of Electrical and Computer Engineering | Year: 2018	2018-10-01	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-85116943118	f	2
43	Improve malware classifiers performance using cost-sensitive learning for imbalanced dataset	\N	Authors: Ben Abdel Ouahab I. | Published in: Iaes International Journal of Artificial Intelligence | Year: 2023	2023-12-01	2	https://www.scopus.com/record/display.uri?eid=2-s2.0-85166955683	f	2
44	Machine learning based augmented reality for improved learning application through object detection algorithms	\N	Authors: Hanafi A. | Published in: International Journal of Electrical and Computer Engineering | Year: 2023	2023-04-01	9	https://www.scopus.com/record/display.uri?eid=2-s2.0-85143876800	f	2
45	Yet Another Serious Game in Arabic	\N	Authors: Alaoui Y. | Published in: ACM International Conference Proceeding Series | Year: 2023	2023-05-24	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-85180128161	f	2
46	Towards a new concept of serious games generator	\N	Authors: Eaachak L. | Published in: Proceedings of 2015 International Conference on Electrical and Information Technologies Iceit 2015 | Year: 2015	2015-07-17	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-84945291418	f	2
47	Applications of Text Generation in Digital Marketing: a review	\N	Authors: Loukili S. | Published in: ACM International Conference Proceeding Series | Year: 2023	2023-05-24	1	https://www.scopus.com/record/display.uri?eid=2-s2.0-85180123113	f	2
48	Domain Knowledge Preservation in Financial Machine Learning: Evidence from Autocallable Note Pricing	\N	Authors: Ahnouch M. | Published in: Risks | Year: 2025	2025-07-01	1	https://www.scopus.com/record/display.uri?eid=2-s2.0-105011620588	f	2
49	Enhancing Malware Classification with Vision Transformers: A Comparative Study with Traditional CNN Models	\N	Authors: Ben Abdel Ouahab I. | Published in: ACM International Conference Proceeding Series | Year: 2023	2023-05-24	4	https://www.scopus.com/record/display.uri?eid=2-s2.0-85180130216	f	2
50	Email subjects generation with large language models: GPT-3.5, PaLM 2, and BERT	\N	Authors: Loukili S. | Published in: International Journal of Electrical and Computer Engineering | Year: 2024	2024-08-01	5	https://www.scopus.com/record/display.uri?eid=2-s2.0-85195209396	f	2
51	Machine Learning-BASED AUGMENTED REALITY FOR IMPROVED TEXT GENERATION THROUGH RECURRENT NEURAL NETWORKS	\N	Authors: Hanafi A. | Published in: Journal of Theoretical and Applied Information Technology | Year: 2022	2022-01-31	3	https://www.scopus.com/record/display.uri?eid=2-s2.0-85124453788	f	2
52	Towards a Mobile Serious Game for Learning Object Oriented Programming Paradigms	\N	Authors: Lotfi E. | Published in: Lecture Notes in Intelligent Transportation and Infrastructure | Year: 2019	2019-01-01	4	https://www.scopus.com/record/display.uri?eid=2-s2.0-85147801934	f	2
27	Review on Training LLMs on One Single GPU in Term of Speed, Efficiency, Memory and Energy Consumption	\N	Authors: Jouad M.B. | Published in: Studies in Systems Decision and Control | Year: 2026	2026-01-01	0	https://www.scopus.com/record/display.uri?eid=2-s2.0-105020424435	t	2
\.


--
-- TOC entry 5113 (class 0 OID 31634)
-- Dependencies: 220
-- Data for Name: specialites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specialites (id, nom, description) FROM stdin;
1	Cybersécurité	
2	Intelligence Artificielle	
3	Systèmes et Réseaux	
4	Génie Logiciel	\N
5	Informatique Embarquée	\N
6	Physique Théorique	\N
7	Chimie Analytique	\N
\.


--
-- TOC entry 5115 (class 0 OID 31646)
-- Dependencies: 222
-- Data for Name: thematiques_de_recherche; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.thematiques_de_recherche (id, nom, description) FROM stdin;
1	Sécurité des Données et Cryptographie	
2	Cloud Computing et Architectures Distribuées	
3	Big Data et Analyse de Données	
4	Internet des Objets (IoT) et Systèmes Embarqués	
5	Blockchain et Technologies Distribuées	\N
6	Robotique et Automatisation	\N
7	 Génie Civil et Structures	\N
8	Nanotechnologies	\N
\.


--
-- TOC entry 5111 (class 0 OID 31622)
-- Dependencies: 218
-- Data for Name: universities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.universities (id, nom, adresse, ville, pays, "Logo") FROM stdin;
4	Hassan II University of Casablanca	690 Avenue 2 Mars, Casablanca, Casablanca-Settat 20480	Casablanca	Maroc	https://www.univh2c.ma/sites/default/files/Logo_UHIIC_0.png
5	UNIVERSITE SIDI MOHAMED BEN ABDDELAH	Route Imouzzer, FES 30000	Fes	Maroc	https://www.usmba.ac.ma/~usmba2/wp-content/uploads/2019/06/usmba_90h.png
3	Université Abdelmalek Essaâdi	93030 Tétouan 	Tétouan 	Maroc	https://th.bing.com/th/id/OIP.t1wLR9gqCIFGJG8lTPf3sgHaD4?w=286&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3
\.


--
-- TOC entry 5127 (class 0 OID 31786)
-- Dependencies: 234
-- Data for Name: user_specialite_association; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_specialite_association ("userId", "specialiteId") FROM stdin;
5	1
5	2
4	1
6	5
4	2
8	1
\.


--
-- TOC entry 5126 (class 0 OID 31771)
-- Dependencies: 233
-- Data for Name: user_thematique_association; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_thematique_association ("userId", "thematiqueId") FROM stdin;
5	2
5	1
5	3
4	1
6	4
6	6
8	1
8	3
\.


--
-- TOC entry 5125 (class 0 OID 31726)
-- Dependencies: 232
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, "fullName", password, email, user_type, profile_completed, otp_configured, otp_secret, nom, prenom, grade, "dateDeNaissance", "photoDeProfil", "numeroDeSomme", "universityId", "etablissementId", "departementId", "laboratoireId", "equipeId", "specialiteId", "thematiqueDeRechercheId", email_verified, email_verification_token, email_verification_token_expiry) FROM stdin;
8	Abdellah Afroukh	$argon2id$v=19$m=65536,t=3,p=4$sLaWkrKWci6FkDJGqNUa4w$+J6em5uNRlqUfpYD5SLEE5YHz0r3HQObVW6AwxqPN3Y	abdellahwidad002@gmail.com	DOCTORANT	t	f	gAAAAABpi19bFTMMOfFZEGrzQdfByI7WQgspwC4f8G0c8Z12MvopP0iCbsa8zbbvsQ1Tx6MttxHYHJALEQrGikfpAhVX8VWoEpbccjAIqlK8OIJ1Uvagbg5KocQhyLwoNJ7gbSt8XYep	Afroukh	Abdellah	\N	2002-10-27	http://localhost:8000/upload/files/8b058d16-6f35-46f3-9b46-d7da36cd47a9.jpeg	\N	3	1	1	1	1	\N	\N	t	\N	\N
4	doctorant1	$argon2id$v=19$m=65536,t=3,p=4$KyUEICSktFYKgZDS2rs3Zg$QLSnAxOHpbzoPy2/EECa+DXRh1bPW03c1QySRCt5cTk	doctorant1@example.com	DOCTORANT	t	t	gAAAAABpw-k_2SX4d1fcdS6hXOwE4y6De1QeNcwOkrkutzsvfY7cz31TLQfsxoT-I4n2ib9Vnrq5ed9-RK7ynhVPo727r4DdmwkAa0rs8Y_oSadyCIh9qBaByY4rVY4yMkj48SmUJVtG	doctorant1	doctorant1	\N	2002-10-27	https://tse1.mm.bing.net/th/id/OIP.YIre5HGHiqBa7DCmrF4KwwHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3	\N	3	1	1	1	1	1	1	t	\N	\N
1	admin	$argon2id$v=19$m=65536,t=3,p=4$5/xfC4GQcm6t9Z4zZqx1zg$+iFdpkGsS++hgM6A0qf+Dz2VMdg8tTMJZqUvVBfTFgM	admin@example.com	ADMIN	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N
2	prof1	$argon2id$v=19$m=65536,t=3,p=4$tpbS+t+71xrj/P//X0spBQ$q86wVYqqMSXKirvgUDI162lre6w/NmQkszUhgrZhXEY	prof1@example.com	ENSEIGNANT	t	t	NS3EA4454CBM2TKWNGBJQPZWICWBQMK7	prof1	prfo1	\N	\N	\N	12345	3	1	1	1	1	1	1	t	\N	\N
5	Doctorant2	$argon2id$v=19$m=65536,t=3,p=4$sfZea825N6Z0DsH4P6e01g$X97BJHQUBGKyLm50/fo/Xl7m7bAAcipi8nNcPbGLL0E	doctorant2@example.com	DOCTORANT	t	f	\N	2	doctorant	\N	1998-11-18	http://localhost:8000/upload/files/73c57ffa-c22a-4e85-bc4e-b68d03485966.jpeg	\N	3	1	1	1	1	1	1	t	\N	\N
6	Prof2	$argon2id$v=19$m=65536,t=3,p=4$a611rrUWYuz9f28NgfAeww$pcq3ws10fix01YrQ0fO4BKF3FZaRcSuKdypu3h6mudo	prof2@example.com	ENSEIGNANT	t	f	\N	Afroukh	Abdellah	Professor	1980-03-29	https://th.bing.com/th/id/OIF.W5OmERkLF0v75w3YQiq2mw?w=208&h=268&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3	9120934	3	1	1	1	1	2	3	t	\N	\N
\.


--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 241
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 14, true);


--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 261
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 22, true);


--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 253
-- Name: competences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.competences_id_seq', 7, true);


--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 243
-- Name: connections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.connections_id_seq', 45, true);


--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 249
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contacts_id_seq', 3, true);


--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 239
-- Name: cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cvs_id_seq', 4, true);


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 229
-- Name: departements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departements_id_seq', 1, true);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 227
-- Name: equipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipes_id_seq', 1, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 223
-- Name: etablissements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etablissements_id_seq', 2, true);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 257
-- Name: experiences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.experiences_id_seq', 2, true);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 251
-- Name: formations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formations_id_seq', 5, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 237
-- Name: google_scholar_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.google_scholar_integrations_id_seq', 4, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 225
-- Name: laboratoires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.laboratoires_id_seq', 1, true);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 255
-- Name: langues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.langues_id_seq', 6, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 259
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 101, true);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 245
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posts_id_seq', 29, true);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 235
-- Name: projets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projets_id_seq', 1, true);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 247
-- Name: publications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.publications_id_seq', 147, true);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 263
-- Name: reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reactions_id_seq', 29, true);


--
-- TOC entry 5212 (class 0 OID 0)
-- Dependencies: 266
-- Name: scopus_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scopus_integrations_id_seq', 2, true);


--
-- TOC entry 5213 (class 0 OID 0)
-- Dependencies: 268
-- Name: scopus_publications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scopus_publications_id_seq', 52, true);


--
-- TOC entry 5214 (class 0 OID 0)
-- Dependencies: 219
-- Name: specialites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.specialites_id_seq', 7, true);


--
-- TOC entry 5215 (class 0 OID 0)
-- Dependencies: 221
-- Name: thematiques_de_recherche_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.thematiques_de_recherche_id_seq', 8, true);


--
-- TOC entry 5216 (class 0 OID 0)
-- Dependencies: 217
-- Name: universities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.universities_id_seq', 5, true);


--
-- TOC entry 5217 (class 0 OID 0)
-- Dependencies: 231
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- TOC entry 4875 (class 2606 OID 31858)
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- TOC entry 4907 (class 2606 OID 32023)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 4895 (class 2606 OID 31958)
-- Name: competences competences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competences
    ADD CONSTRAINT competences_pkey PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 31876)
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 31928)
-- Name: contacts contacts_cvId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "contacts_cvId_key" UNIQUE ("cvId");


--
-- TOC entry 4889 (class 2606 OID 31926)
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 31843)
-- Name: cvs cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT cvs_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 31845)
-- Name: cvs cvs_userId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT "cvs_userId_key" UNIQUE ("userId");


--
-- TOC entry 4847 (class 2606 OID 31718)
-- Name: departements departements_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT departements_nom_key UNIQUE (nom);


--
-- TOC entry 4849 (class 2606 OID 31716)
-- Name: departements departements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT departements_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 31701)
-- Name: equipes equipes_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_nom_key UNIQUE (nom);


--
-- TOC entry 4844 (class 2606 OID 31699)
-- Name: equipes equipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT equipes_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 31667)
-- Name: etablissements etablissements_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etablissements
    ADD CONSTRAINT etablissements_nom_key UNIQUE (nom);


--
-- TOC entry 4834 (class 2606 OID 31665)
-- Name: etablissements etablissements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etablissements
    ADD CONSTRAINT etablissements_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 31988)
-- Name: experiences experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT experiences_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 31943)
-- Name: formations formations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT formations_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 31826)
-- Name: google_scholar_integrations google_scholar_integrations_googleScholarId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_scholar_integrations
    ADD CONSTRAINT "google_scholar_integrations_googleScholarId_key" UNIQUE ("googleScholarId");


--
-- TOC entry 4865 (class 2606 OID 31824)
-- Name: google_scholar_integrations google_scholar_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_scholar_integrations
    ADD CONSTRAINT google_scholar_integrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 31828)
-- Name: google_scholar_integrations google_scholar_integrations_userId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_scholar_integrations
    ADD CONSTRAINT "google_scholar_integrations_userId_key" UNIQUE ("userId");


--
-- TOC entry 4913 (class 2606 OID 32074)
-- Name: group_chat_members group_chat_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_pkey PRIMARY KEY (chat_id, user_id);


--
-- TOC entry 4838 (class 2606 OID 31684)
-- Name: laboratoires laboratoires_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratoires
    ADD CONSTRAINT laboratoires_nom_key UNIQUE (nom);


--
-- TOC entry 4840 (class 2606 OID 31682)
-- Name: laboratoires laboratoires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratoires
    ADD CONSTRAINT laboratoires_pkey PRIMARY KEY (id);


--
-- TOC entry 4899 (class 2606 OID 31973)
-- Name: langues langues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.langues
    ADD CONSTRAINT langues_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 32003)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 31896)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 31809)
-- Name: projets projets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projets
    ADD CONSTRAINT projets_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 2606 OID 31911)
-- Name: publications publications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT publications_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 32041)
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 32094)
-- Name: scopus_integrations scopus_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_integrations
    ADD CONSTRAINT scopus_integrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4919 (class 2606 OID 32096)
-- Name: scopus_integrations scopus_integrations_userId_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_integrations
    ADD CONSTRAINT "scopus_integrations_userId_key" UNIQUE ("userId");


--
-- TOC entry 4922 (class 2606 OID 32112)
-- Name: scopus_publications scopus_publications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_publications
    ADD CONSTRAINT scopus_publications_pkey PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 31643)
-- Name: specialites specialites_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialites
    ADD CONSTRAINT specialites_nom_key UNIQUE (nom);


--
-- TOC entry 4825 (class 2606 OID 31641)
-- Name: specialites specialites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specialites
    ADD CONSTRAINT specialites_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 31655)
-- Name: thematiques_de_recherche thematiques_de_recherche_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thematiques_de_recherche
    ADD CONSTRAINT thematiques_de_recherche_nom_key UNIQUE (nom);


--
-- TOC entry 4830 (class 2606 OID 31653)
-- Name: thematiques_de_recherche thematiques_de_recherche_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thematiques_de_recherche
    ADD CONSTRAINT thematiques_de_recherche_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 31631)
-- Name: universities universities_nom_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_nom_key UNIQUE (nom);


--
-- TOC entry 4820 (class 2606 OID 31629)
-- Name: universities universities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.universities
    ADD CONSTRAINT universities_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 31790)
-- Name: user_specialite_association user_specialite_association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_specialite_association
    ADD CONSTRAINT user_specialite_association_pkey PRIMARY KEY ("userId", "specialiteId");


--
-- TOC entry 4856 (class 2606 OID 31775)
-- Name: user_thematique_association user_thematique_association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thematique_association
    ADD CONSTRAINT user_thematique_association_pkey PRIMARY KEY ("userId", "thematiqueId");


--
-- TOC entry 4854 (class 2606 OID 31733)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 1259 OID 31869)
-- Name: ix_chats_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_chats_id ON public.chats USING btree (id);


--
-- TOC entry 4908 (class 1259 OID 32034)
-- Name: ix_comments_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_comments_id ON public.comments USING btree (id);


--
-- TOC entry 4896 (class 1259 OID 31964)
-- Name: ix_competences_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_competences_id ON public.competences USING btree (id);


--
-- TOC entry 4879 (class 1259 OID 31887)
-- Name: ix_connections_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_connections_id ON public.connections USING btree (id);


--
-- TOC entry 4890 (class 1259 OID 31934)
-- Name: ix_contacts_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_contacts_id ON public.contacts USING btree (id);


--
-- TOC entry 4873 (class 1259 OID 31851)
-- Name: ix_cvs_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_cvs_id ON public.cvs USING btree (id);


--
-- TOC entry 4850 (class 1259 OID 31724)
-- Name: ix_departements_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_departements_id ON public.departements USING btree (id);


--
-- TOC entry 4845 (class 1259 OID 31707)
-- Name: ix_equipes_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_equipes_id ON public.equipes USING btree (id);


--
-- TOC entry 4835 (class 1259 OID 31673)
-- Name: ix_etablissements_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_etablissements_id ON public.etablissements USING btree (id);


--
-- TOC entry 4902 (class 1259 OID 31994)
-- Name: ix_experiences_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_experiences_id ON public.experiences USING btree (id);


--
-- TOC entry 4893 (class 1259 OID 31949)
-- Name: ix_formations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_formations_id ON public.formations USING btree (id);


--
-- TOC entry 4868 (class 1259 OID 31834)
-- Name: ix_google_scholar_integrations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_google_scholar_integrations_id ON public.google_scholar_integrations USING btree (id);


--
-- TOC entry 4836 (class 1259 OID 31690)
-- Name: ix_laboratoires_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_laboratoires_id ON public.laboratoires USING btree (id);


--
-- TOC entry 4897 (class 1259 OID 31979)
-- Name: ix_langues_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_langues_id ON public.langues USING btree (id);


--
-- TOC entry 4903 (class 1259 OID 32014)
-- Name: ix_messages_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_messages_id ON public.messages USING btree (id);


--
-- TOC entry 4880 (class 1259 OID 31902)
-- Name: ix_posts_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_posts_id ON public.posts USING btree (id);


--
-- TOC entry 4859 (class 1259 OID 31815)
-- Name: ix_projets_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_projets_id ON public.projets USING btree (id);


--
-- TOC entry 4883 (class 1259 OID 31917)
-- Name: ix_publications_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_publications_id ON public.publications USING btree (id);


--
-- TOC entry 4909 (class 1259 OID 32057)
-- Name: ix_reactions_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_reactions_id ON public.reactions USING btree (id);


--
-- TOC entry 4914 (class 1259 OID 32102)
-- Name: ix_scopus_integrations_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_scopus_integrations_id ON public.scopus_integrations USING btree (id);


--
-- TOC entry 4915 (class 1259 OID 32103)
-- Name: ix_scopus_integrations_scopusAuthorId; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ix_scopus_integrations_scopusAuthorId" ON public.scopus_integrations USING btree ("scopusAuthorId");


--
-- TOC entry 4920 (class 1259 OID 32118)
-- Name: ix_scopus_publications_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_scopus_publications_id ON public.scopus_publications USING btree (id);


--
-- TOC entry 4821 (class 1259 OID 31644)
-- Name: ix_specialites_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_specialites_id ON public.specialites USING btree (id);


--
-- TOC entry 4826 (class 1259 OID 31656)
-- Name: ix_thematiques_de_recherche_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_thematiques_de_recherche_id ON public.thematiques_de_recherche USING btree (id);


--
-- TOC entry 4816 (class 1259 OID 31632)
-- Name: ix_universities_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_universities_id ON public.universities USING btree (id);


--
-- TOC entry 4851 (class 1259 OID 31769)
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- TOC entry 4852 (class 1259 OID 31770)
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- TOC entry 4941 (class 2606 OID 31859)
-- Name: chats chats_user1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT "chats_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES public.users(id);


--
-- TOC entry 4942 (class 2606 OID 31864)
-- Name: chats chats_user2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT "chats_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES public.users(id);


--
-- TOC entry 4955 (class 2606 OID 32024)
-- Name: comments comments_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id);


--
-- TOC entry 4956 (class 2606 OID 32029)
-- Name: comments comments_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4950 (class 2606 OID 31959)
-- Name: competences competences_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.competences
    ADD CONSTRAINT "competences_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public.cvs(id);


--
-- TOC entry 4943 (class 2606 OID 31882)
-- Name: connections connections_receiverId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT "connections_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES public.users(id);


--
-- TOC entry 4944 (class 2606 OID 31877)
-- Name: connections connections_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT "connections_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id);


--
-- TOC entry 4948 (class 2606 OID 31929)
-- Name: contacts contacts_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "contacts_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public.cvs(id);


--
-- TOC entry 4940 (class 2606 OID 31846)
-- Name: cvs cvs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT "cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4926 (class 2606 OID 31719)
-- Name: departements departements_etablissementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departements
    ADD CONSTRAINT "departements_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES public.etablissements(id);


--
-- TOC entry 4925 (class 2606 OID 31702)
-- Name: equipes equipes_universityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipes
    ADD CONSTRAINT "equipes_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES public.universities(id);


--
-- TOC entry 4923 (class 2606 OID 31668)
-- Name: etablissements etablissements_universityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etablissements
    ADD CONSTRAINT "etablissements_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES public.universities(id);


--
-- TOC entry 4952 (class 2606 OID 31989)
-- Name: experiences experiences_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.experiences
    ADD CONSTRAINT "experiences_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public.cvs(id);


--
-- TOC entry 4945 (class 2606 OID 32119)
-- Name: posts fk_posts_scopus_publication_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT fk_posts_scopus_publication_id FOREIGN KEY ("scopusPublicationId") REFERENCES public.scopus_publications(id) ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 31944)
-- Name: formations formations_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations
    ADD CONSTRAINT "formations_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public.cvs(id);


--
-- TOC entry 4939 (class 2606 OID 31829)
-- Name: google_scholar_integrations google_scholar_integrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.google_scholar_integrations
    ADD CONSTRAINT "google_scholar_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4960 (class 2606 OID 32075)
-- Name: group_chat_members group_chat_members_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- TOC entry 4961 (class 2606 OID 32080)
-- Name: group_chat_members group_chat_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.group_chat_members
    ADD CONSTRAINT group_chat_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4924 (class 2606 OID 31685)
-- Name: laboratoires laboratoires_univesityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.laboratoires
    ADD CONSTRAINT "laboratoires_univesityId_fkey" FOREIGN KEY ("universityId") REFERENCES public.universities(id);


--
-- TOC entry 4951 (class 2606 OID 31974)
-- Name: langues langues_cvId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.langues
    ADD CONSTRAINT "langues_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES public.cvs(id);


--
-- TOC entry 4953 (class 2606 OID 32004)
-- Name: messages messages_chatId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES public.chats(id);


--
-- TOC entry 4954 (class 2606 OID 32009)
-- Name: messages messages_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public.users(id);


--
-- TOC entry 4946 (class 2606 OID 31897)
-- Name: posts posts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4938 (class 2606 OID 31810)
-- Name: projets projets_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projets
    ADD CONSTRAINT "projets_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4947 (class 2606 OID 31912)
-- Name: publications publications_googleScholarIntegrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.publications
    ADD CONSTRAINT "publications_googleScholarIntegrationId_fkey" FOREIGN KEY ("googleScholarIntegrationId") REFERENCES public.google_scholar_integrations(id);


--
-- TOC entry 4957 (class 2606 OID 32052)
-- Name: reactions reactions_commentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT "reactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES public.comments(id);


--
-- TOC entry 4958 (class 2606 OID 32042)
-- Name: reactions reactions_postId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT "reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES public.posts(id);


--
-- TOC entry 4959 (class 2606 OID 32047)
-- Name: reactions reactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4962 (class 2606 OID 32097)
-- Name: scopus_integrations scopus_integrations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_integrations
    ADD CONSTRAINT "scopus_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4963 (class 2606 OID 32113)
-- Name: scopus_publications scopus_publications_scopusIntegrationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scopus_publications
    ADD CONSTRAINT "scopus_publications_scopusIntegrationId_fkey" FOREIGN KEY ("scopusIntegrationId") REFERENCES public.scopus_integrations(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 31796)
-- Name: user_specialite_association user_specialite_association_specialiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_specialite_association
    ADD CONSTRAINT "user_specialite_association_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES public.specialites(id);


--
-- TOC entry 4937 (class 2606 OID 31791)
-- Name: user_specialite_association user_specialite_association_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_specialite_association
    ADD CONSTRAINT "user_specialite_association_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4934 (class 2606 OID 31781)
-- Name: user_thematique_association user_thematique_association_thematiqueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thematique_association
    ADD CONSTRAINT "user_thematique_association_thematiqueId_fkey" FOREIGN KEY ("thematiqueId") REFERENCES public.thematiques_de_recherche(id);


--
-- TOC entry 4935 (class 2606 OID 31776)
-- Name: user_thematique_association user_thematique_association_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_thematique_association
    ADD CONSTRAINT "user_thematique_association_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- TOC entry 4927 (class 2606 OID 31744)
-- Name: users users_departementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_departementId_fkey" FOREIGN KEY ("departementId") REFERENCES public.departements(id);


--
-- TOC entry 4928 (class 2606 OID 31754)
-- Name: users users_equipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES public.equipes(id);


--
-- TOC entry 4929 (class 2606 OID 31739)
-- Name: users users_etablissementId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES public.etablissements(id);


--
-- TOC entry 4930 (class 2606 OID 31749)
-- Name: users users_laboratoireId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_laboratoireId_fkey" FOREIGN KEY ("laboratoireId") REFERENCES public.laboratoires(id);


--
-- TOC entry 4931 (class 2606 OID 31759)
-- Name: users users_specialiteId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_specialiteId_fkey" FOREIGN KEY ("specialiteId") REFERENCES public.specialites(id);


--
-- TOC entry 4932 (class 2606 OID 31764)
-- Name: users users_thematiqueDeRechercheId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_thematiqueDeRechercheId_fkey" FOREIGN KEY ("thematiqueDeRechercheId") REFERENCES public.thematiques_de_recherche(id);


--
-- TOC entry 4933 (class 2606 OID 31734)
-- Name: users users_universityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES public.universities(id);


--
-- TOC entry 5109 (class 6104 OID 40262)
-- Name: linkedin_publication; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION linkedin_publication FOR ALL TABLES WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION linkedin_publication OWNER TO postgres;

-- Completed on 2026-03-30 11:36:14

--
-- PostgreSQL database dump complete
--

