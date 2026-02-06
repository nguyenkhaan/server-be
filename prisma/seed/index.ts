import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient , Role } from '@prisma/client';
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding started...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.listeningHistory.deleteMany({});
  await prisma.followers.deleteMany({});
  await prisma.likes.deleteMany({});
  await prisma.playlistTrack.deleteMany({});
  await prisma.playlist.deleteMany({});
  await prisma.trackArtist.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.albumGenre.deleteMany({});
  await prisma.album.deleteMany({});
  await prisma.artistGenre.deleteMany({});
  await prisma.artist.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Existing data cleared.');

  // Create Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: 'password123',
          active: true,
          date_of_birth: new Date(1990 + i, i % 12, (i % 28) + 1),
          profile_avatr: `https://i.pravatar.cc/150?u=user${i + 1}`,
        },
      })
    )
  );
  console.log(`${users.length} users created.`);
   //Create admin
   const admin = await prisma.user.create({
     data: {
         email : 'admin@gmail.com',
         date_of_birth: new Date().toISOString(),
         password : 'admin',
         name: 'admin',
         active: true
     }
   });
   console.log('Admin user created.');

   // Create Roles for all users
   const allUsers = [...users, admin];
   let roleIdCounter = 1;
   const userRoles = allUsers.reduce((acc, user, i) => {
     if (user.email === 'admin@gmail.com') {
       acc.push(
         { id: roleIdCounter++, userID: user.id, role: Role.ADMIN },
         { id: roleIdCounter++, userID: user.id, role: Role.USER },
         { id: roleIdCounter++, userID: user.id, role: Role.ARTIST }
       );
     } else {
       acc.push({
         id: roleIdCounter++,
         userID: user.id,
         role: [Role.USER, Role.MANAGER, Role.ARTIST][i % 3],
       });
     }
     return acc;
   }, [] as { id: number; userID: number; role: Role }[]);

   await prisma.userRole.createMany({
    data : userRoles 
   })
   console.log('User roles created.');

  // Create Genres
  const genreNames = ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop'];
  const genres = await Promise.all(
    genreNames.map((name) => prisma.genre.create({ data: { name } }))
  );
  console.log(`${genres.length} genres created.`);

  // Create Artists
  const artists = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.artist.create({
        data: {
          name: `Artist ${i + 1}`,
          active: true,
          profile_avatar: `https://i.pravatar.cc/150?u=artist${i + 1}`,
        },
      })
    )
  );
  console.log(`${artists.length} artists created.`);

  // Create Artist-Genre relationships
  await prisma.artistGenre.createMany({
    data: artists.flatMap((artist, i) =>
      [genres[i % genres.length], genres[(i + 1) % genres.length]].map(
        (genre) => ({
          artistID: artist.id,
          genreID: genre.id,
        })
      )
    ),
  });
  console.log('Artist-genre relationships created.');

  // Create Albums
  const albums = await Promise.all(
    artists.flatMap((artist, i) =>
      Array.from({ length: 2 }).map((_, j) =>
        prisma.album.create({
          data: {
            artistID: artist.id,
            name: `Album ${i * 2 + j + 1} by ${artist.name}`,
            release_date: new Date(2020 + j, i, 1),
            thumbnail: `https://picsum.photos/seed/album${i * 2 + j + 1}/200`,
          },
        })
      )
    )
  );
  console.log(`${albums.length} albums created.`);

  // Create Album-Genre relationships
  await prisma.albumGenre.createMany({
    data: albums.flatMap((album, i) =>
      [genres[i % genres.length]].map((genre) => ({
        albumID: album.id,
        genreID: genre.id,
      }))
    ),
  });
  console.log('Album-genre relationships created.');

  // Create Tracks
  const tracks = await Promise.all(
    albums.flatMap((album) =>
      Array.from({ length: 5 }).map((_, i) =>
        prisma.track.create({
          data: {
            albumID: album.id,
            title: `Track ${i + 1} for ${album.name}`,
            duration: 180 + i * 10,
            file_path: `/music/track_${album.id}_${i + 1}.mp3`,
            track_number: i + 1,
          },
        })
      )
    )
  );
  console.log(`${tracks.length} tracks created.`);

  // Create Track-Artist relationships
  await prisma.trackArtist.createMany({
    data: tracks.map((track, i) => ({
      trackID: track.id,
      artistID: artists[i % artists.length].id,
    })),
  });
  console.log('Track-artist relationships created.');

  // Create Playlists
  const playlists = await Promise.all(
    users.flatMap((user, i) =>
      Array.from({ length: 2 }).map((_, j) =>
        prisma.playlist.create({
          data: {
            userID: user.id,
            name: `Playlist ${j + 1} for ${user.name}`,
            img: `https://picsum.photos/seed/playlist${i * 2 + j + 1}/200`,
          },
        })
      )
    )
  );
  console.log(`${playlists.length} playlists created.`);

  // Create Playlist-Track relationships
  await prisma.playlistTrack.createMany({
    data: playlists.flatMap((playlist, i) =>
      tracks.slice(i * 5, i * 5 + 5).map((track) => ({
        playlistID: playlist.id,
        trackID: track.id,
      }))
    ),
  });
  console.log('Playlist-track relationships created.');

  // Create Likes
  await prisma.likes.createMany({
    data: users.flatMap((user, i) =>
      tracks.slice(i * 2, i * 2 + 10).map((track) => ({
        userID: user.id,
        trackID: track.id,
      }))
    ),
  });
  console.log('Likes created.');

  // Create Followers
  await prisma.followers.createMany({
    data: users.flatMap((user, i) =>
      artists
        .filter((a) => a.id !== artists[i % artists.length].id)
        .map((artist) => ({
          userID: user.id,
          artistID: artist.id,
        }))
    ),
  });
  console.log('Followers created.');

  // Create Listening History
  await prisma.listeningHistory.createMany({
    data: users.flatMap((user, i) =>
      tracks.slice(i * 3, i * 3 + 20).map((track) => ({
        userID: user.id,
        trackID: track.id,
        played_at: new Date(),
      }))
    ),
  });
  console.log('Listening histories created.');

  console.log('Seeding finished.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });