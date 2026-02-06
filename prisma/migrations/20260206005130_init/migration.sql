-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER', 'ARTIST');

-- CreateEnum
CREATE TYPE "FUNCTOKETYPE" AS ENUM ('VERIFY_EMAIL', 'RESET_PASSWORD');

-- CreateEnum
CREATE TYPE "AUTHTOKENTYPE" AS ENUM ('ACCESS', 'REFRESH');

-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "artistID" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "active" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "profile_avatar" TEXT,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordVerificationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "PasswordVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "type" "AUTHTOKENTYPE" NOT NULL,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistGenre" (
    "artistID" INTEGER NOT NULL,
    "genreID" INTEGER NOT NULL,

    CONSTRAINT "ArtistGenre_pkey" PRIMARY KEY ("artistID","genreID")
);

-- CreateTable
CREATE TABLE "AlbumGenre" (
    "genreID" INTEGER NOT NULL,
    "albumID" INTEGER NOT NULL,

    CONSTRAINT "AlbumGenre_pkey" PRIMARY KEY ("genreID","albumID")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "img" TEXT,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Followers" (
    "userID" INTEGER NOT NULL,
    "artistID" INTEGER NOT NULL,

    CONSTRAINT "Followers_pkey" PRIMARY KEY ("userID","artistID")
);

-- CreateTable
CREATE TABLE "Likes" (
    "userID" INTEGER NOT NULL,
    "trackID" INTEGER NOT NULL,

    CONSTRAINT "Likes_pkey" PRIMARY KEY ("userID","trackID")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "albumID" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "track_number" INTEGER,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackArtist" (
    "trackID" INTEGER NOT NULL,
    "artistID" INTEGER NOT NULL,

    CONSTRAINT "TrackArtist_pkey" PRIMARY KEY ("trackID","artistID")
);

-- CreateTable
CREATE TABLE "PlaylistTrack" (
    "playlistID" INTEGER NOT NULL,
    "trackID" INTEGER NOT NULL,

    CONSTRAINT "PlaylistTrack_pkey" PRIMARY KEY ("trackID","playlistID")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_avatr" TEXT,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listeningHistory" (
    "userID" INTEGER NOT NULL,
    "trackID" INTEGER NOT NULL,
    "played_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listeningHistory_pkey" PRIMARY KEY ("userID","trackID")
);

-- CreateIndex
CREATE INDEX "Album_release_date_idx" ON "Album"("release_date");

-- CreateIndex
CREATE INDEX "Album_artistID_name_idx" ON "Album"("artistID", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_user_id_key" ON "Artist"("user_id");

-- CreateIndex
CREATE INDEX "Artist_name_idx" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordVerificationToken_token_key" ON "PasswordVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_token_key" ON "AuthToken"("token");

-- CreateIndex
CREATE INDEX "AuthToken_user_id_type_idx" ON "AuthToken"("user_id", "type");

-- CreateIndex
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Playlist_name_idx" ON "Playlist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_active_idx" ON "User"("active");

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistID_fkey" FOREIGN KEY ("artistID") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistGenre" ADD CONSTRAINT "ArtistGenre_artistID_fkey" FOREIGN KEY ("artistID") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistGenre" ADD CONSTRAINT "ArtistGenre_genreID_fkey" FOREIGN KEY ("genreID") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumGenre" ADD CONSTRAINT "AlbumGenre_genreID_fkey" FOREIGN KEY ("genreID") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumGenre" ADD CONSTRAINT "AlbumGenre_albumID_fkey" FOREIGN KEY ("albumID") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followers" ADD CONSTRAINT "Followers_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followers" ADD CONSTRAINT "Followers_artistID_fkey" FOREIGN KEY ("artistID") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Likes" ADD CONSTRAINT "Likes_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumID_fkey" FOREIGN KEY ("albumID") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackArtist" ADD CONSTRAINT "TrackArtist_artistID_fkey" FOREIGN KEY ("artistID") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_playlistID_fkey" FOREIGN KEY ("playlistID") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistTrack" ADD CONSTRAINT "PlaylistTrack_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listeningHistory" ADD CONSTRAINT "listeningHistory_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listeningHistory" ADD CONSTRAINT "listeningHistory_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
