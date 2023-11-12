import Link from 'next/link';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material';
import ImportContactsIcon from '@mui/icons-material/ImportContacts'; // 理解度ステータス用アイコン
import BookmarksIcon from '@mui/icons-material/Bookmarks'; // マイ単語帳用アイコン
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // 単語理解度チェック用アイコン

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
          <ListItem button component="a" href="/">
            <ListItemIcon>
              <CheckCircleIcon /> 
            </ListItemIcon>
            <ListItemText primary="ホーム" />
          </ListItem>
          <ListItem button component="a" href="/word-master/progressByBlockTheme">
            <ListItemIcon>
              <ImportContactsIcon /> {/* 理解度ステータスのアイコン */}
            </ListItemIcon>
            <ListItemText primary="英単語マスター" />
          </ListItem>
          <ListItem button component="a" href="/word-master/myWordList">
            <ListItemIcon>
              <BookmarksIcon /> {/* マイ単語帳のアイコン */}
            </ListItemIcon>
            <ListItemText primary="マイ単語帳" />
          </ListItem>
        </List>

        {/* 他のリストも同様にアイコンを追加可能 */}
      </Box>
    </Drawer>
  );
}

export default Nav;
