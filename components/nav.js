import Link from 'next/link';
import { Drawer, List, ListItem, ListItemText, Typography, Box } from '@mui/material';

const drawerWidth = 240;

function Nav() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem>
            <Typography variant="h6" noWrap component="div">
              単語マスター
            </Typography>
          </ListItem>
          <ListItem button component="a" href="/word-master/statusByTheme">
            <ListItemText primary="テーマ別単語帳" />
          </ListItem>
          <ListItem button component="a" href="/word-master/myWordList">
            <ListItemText primary="マイ単語帳" />
          </ListItem>
          <ListItem button component="a" href="/word-master/wordTest">
            <ListItemText primary="単語理解度チェック" />
          </ListItem>
        </List>

        <List>
          <ListItem>
            <Typography variant="h6" noWrap component="div">
              ライティングマスター
            </Typography>
          </ListItem>
          <ListItem button component="a" href="/writing-master/somePath">
            <ListItemText primary="XXXX" />
          </ListItem>
          {/* 他のセクションも同様に */}
        </List>
      </Box>
    </Drawer>
  );
}

export default Nav;





// import Link from 'next/link';
// import styles from './nav.module.css';

// function Nav() {
//   return (
//     <aside className={styles.sidebar}>
//       <h2>単語マスター</h2>
//       <ul className={styles.sidebarList}>
//         <li className={styles.sidebarItem}>
//           <Link href="/word-master/wordListByTheme">
//             テーマ別単語帳
//           </Link>
//         </li>
//         <li className={styles.sidebarItem}>
//           <Link href="/word-master/myWordList">
//             マイ単語帳
//           </Link>
//         </li>
//         <li className={styles.sidebarItem}>
//           <Link href="/word-master/wordTest">
//             単語理解度チェック
//           </Link>
//         </li>
//       </ul>

//       <h2>ライティングマスター</h2>
//       <ul className={styles.sidebarList}>
//         <li className={styles.sidebarItem}>
//           <Link href="/word-master/wordListByTheme">
//             XXXX
//           </Link>
//         </li>
//       </ul>

//       {/* 他のセクションも同様に */}
//     </aside>
//   );
// }

// export default Nav;
