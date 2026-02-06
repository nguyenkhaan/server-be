-- AlterTable
CREATE SEQUENCE userrole_id_seq;
ALTER TABLE "UserRole" ALTER COLUMN "id" SET DEFAULT nextval('userrole_id_seq');
ALTER SEQUENCE userrole_id_seq OWNED BY "UserRole"."id";
