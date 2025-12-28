import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloudIcon from "@mui/icons-material/Cloud";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import HomeIcon from "@mui/icons-material/Home";
import LyricsIcon from "@mui/icons-material/Lyrics";
import SettingsIcon from "@mui/icons-material/Settings";
import TextFormatIcon from "@mui/icons-material/TextFormat";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import InstallAppSnackbar from "./InstallAppSnackbar";
import _ from "lodash";
import SearchField from "./SearchField";
import { useIntl } from "react-intl";
import { useLocaleState } from "./TranslationProvider";

interface PageLayoutProps {
  title?: string;
  children: any;
  showBack?: boolean;
  showSearchLink?: boolean;
  searchText?: string;
  onChangeSearchText?: (value: string) => void;
  menuItems?: MenuItemDefinition[];
  rightDrawerContent?: any;
  headerButtons?: any;
  searchPlaceholder?: string;
  showLanguageSelector?: boolean;
}

interface MenuItemDefinition {
  text: string;
  onClick: Function;
}

function PageLayout(props: PageLayoutProps) {
  const {
    title,
    children,
    showBack = false,
    menuItems = null,
    showSearchLink = false,
    searchText = "",
    rightDrawerContent = null,
    headerButtons = null,
    onChangeSearchText,
    searchPlaceholder,
    showLanguageSelector = false,
  } = props;

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [locale, setLocale] = useLocaleState();

  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const bottomNavigationUrls = [
    "/",
    "/artists",
    "/songs",
    "/databases",
    "/search",
    "/settings",
  ];
  const intl = useIntl();

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={() => (showBack ? navigate(-1) : setLeftDrawerOpen(true))}
          >
            {showBack ? <ArrowBackIcon /> : <MenuIcon />}
          </IconButton>
          {title && (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
          )}

          {headerButtons}

          {onChangeSearchText && (
            <>
              <SearchField
                value={searchText}
                onChange={onChangeSearchText}
                placeholder={searchPlaceholder}
              />
              {searchText && (
                <IconButton
                  size="large"
                  aria-label="cancel search"
                  edge="end"
                  color="inherit"
                  onClick={() => onChangeSearchText("")}
                >
                  <CancelIcon />
                </IconButton>
              )}
            </>
          )}

          {menuItems && (
            <IconButton
              size="large"
              aria-label="display more actions"
              edge="end"
              color="inherit"
              onClick={(e) => setMenuAnchorEl(e?.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          )}

          {rightDrawerContent && (
            <IconButton
              size="large"
              aria-label="display more actions"
              edge="end"
              color="inherit"
              onClick={() => setRightDrawerOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          )}

          {showSearchLink && (
            <IconButton
              size="large"
              aria-label="search"
              edge="end"
              color="inherit"
              onClick={() => navigate("/search")}
            >
              <SearchIcon />
            </IconButton>
          )}

          {menuItems && (
            <Menu
              id="basic-menu"
              anchorEl={menuAnchorEl}
              open={!!menuAnchorEl}
              onClose={() => setMenuAnchorEl(null)}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setMenuAnchorEl(null);
                  }}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          )}

          {showLanguageSelector && (
            <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="cs">Česky</MenuItem>
            </Select>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={() => setLeftDrawerOpen(false)}
          onKeyDown={() => setLeftDrawerOpen(false)}
        >
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/")}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "home",
                    defaultMessage: "Home",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/databases")}>
                <ListItemIcon>
                  <CloudIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "databases",
                    defaultMessage: "Databases",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/artists")}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "artists",
                    defaultMessage: "Artists",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/songs")}>
                <ListItemIcon>
                  <LyricsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "songs",
                    defaultMessage: "Songs",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/search")}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "search",
                    defaultMessage: "Search",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/settings")}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "settings",
                    defaultMessage: "Settings",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => window.open("https://songspro.github.io/", "_blank")}>
                <ListItemIcon>
                  <TextFormatIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "songproFormat",
                    defaultMessage: "SongPro Format",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={async () => {
                  const upgrading = window.confirm(
                    intl.formatMessage({
                      id: "upgrade-app.confirm",
                      defaultMessage: "This will reload the app and check for updates. Continue?",
                    })
                  );
                  
                  if (!upgrading) return;

                  // Force service worker to update - iOS/iPad compatible approach
                  if ('serviceWorker' in navigator) {
                    try {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      // Unregister all service workers and reload
                      await Promise.all(registrations.map(reg => reg.unregister()));
                      // Clear all caches
                      if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map(name => caches.delete(name)));
                      }
                    } catch (error) {
                      console.error('Error updating service worker:', error);
                    }
                  }
                  // Always reload to get fresh version
                  window.location.reload();
                }}
              >
                <ListItemIcon>
                  <SystemUpdateAltIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "upgrade-app",
                    defaultMessage: "Upgrade app",
                  })}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (
                    window.confirm(
                      intl.formatMessage({
                        id: "delete-all-data.question",
                        defaultMessage: "Really delete all downloaded songs?",
                      })
                    )
                  ) {
                    localStorage.setItem("deleteLocalDatabase", "cloudsongs");
                    document.location.reload();
                  }
                }}
              >
                <ListItemIcon>
                  <DeleteForeverIcon />
                </ListItemIcon>
                <ListItemText
                  primary={intl.formatMessage({
                    id: "delete-all-data",
                    defaultMessage: "Delete all data",
                  })}
                />
              </ListItemButton>
            </ListItem>
          </List>
          {/* <ListItem disablePadding>
            <ListItemButton
              onClick={() =>
                window.open("https://github.com/zpevnikator/songiapp", "_blank")
              }
            >
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary={intl.formatMessage({
                  id: "about",
                  defaultMessage: "About",
                })}
              />
            </ListItemButton>
          </ListItem> */}

          {/* <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
        </Box>
      </Drawer>
      {rightDrawerContent && (
        <Drawer
          anchor="right"
          open={rightDrawerOpen}
          onClose={() => setRightDrawerOpen(false)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            // onClick={() => setRightDrawerOpen(false)}
            // onKeyDown={() => setRightDrawerOpen(false)}
          >
            {rightDrawerContent}
          </Box>
        </Drawer>
      )}
      <Box sx={{ pb: 7, pt: 8 }}>{children}</Box>

      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={_.findIndex(
            bottomNavigationUrls,
            (x) => x == location.pathname
          )}
          onChange={(event, newValue) => {
            navigate(bottomNavigationUrls[newValue]);
          }}
        >
          <BottomNavigationAction
            label={intl.formatMessage({
              id: "home",
              defaultMessage: "Home",
            })}
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label={intl.formatMessage({
              id: "artists",
              defaultMessage: "Artists",
            })}
            icon={<PeopleIcon />}
          />
          <BottomNavigationAction
            label={intl.formatMessage({
              id: "songs",
              defaultMessage: "Songs",
            })}
            icon={<LyricsIcon />}
          />
          <BottomNavigationAction
            label={intl.formatMessage({
              id: "databases",
              defaultMessage: "Databases",
            })}
            icon={<CloudIcon />}
          />
          <BottomNavigationAction
            label={intl.formatMessage({
              id: "search",
              defaultMessage: "Search",
            })}
            icon={<SearchIcon />}
          />
        </BottomNavigation>
      </Paper>

      <InstallAppSnackbar />
    </div>
  );
}

export default PageLayout;
