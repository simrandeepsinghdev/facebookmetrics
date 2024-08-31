import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

const periodOptions = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Days 28", value: "days_28" },
  { label: "Month", value: "month" },
  { label: "Lifetime", value: "lifetime" },
  { label: "Total Over Range", value: "total_over_range" },
];

const Login = () => {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [insights, setInsights] = useState({});
  const [pageId, setPageId] = useState("");
  const [period, setPeriod] = useState("days_28");
  const [since, setSince] = useState(null);
  const [until, setUntil] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(() => {
    window.FB.api("/me", { fields: "name,email,picture" }, (response) => {
      if (response && !response.error) {
        setUser(response);
        fetchUserPages();
      } else {
        setError("Failed to fetch user profile.");
      }
    });
  }, []);

  const statusChangeCallback = useCallback(
    (response) => {
      if (response.status === "connected") {
        fetchUserProfile();
      } else {
        setError("User not connected.");
      }
    },
    [fetchUserProfile]
  );

  useEffect(() => {
    // Check if user is already logged in
    window.FB.getLoginStatus((response) => {
      statusChangeCallback(response);
    });
  }, [statusChangeCallback]);

  const fetchUserPages = () => {
    window.FB.api("/me/accounts", (response) => {
      if (response && !response.error) {
        setPages(response.data);
        setPageId(response?.data?.[0]?.id || "");
      } else {
        setError("Failed to fetch user pages.");
      }
    });
  };

  const handleLogin = () => {
    window.FB.login((response) => {
      if (response?.authResponse) {
        fetchUserProfile();
      } else {
        setError("Login failed.");
      }
    });
  };

  const handlePageChange = (e) => {
    setPageId(e.target.value);
  };

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const fetchPageInsights = useCallback(() => {
    if (!pageId) return;

    setLoading(true);
    setError("");

    const page = pages?.find((x) => x?.id === pageId);
    const sinceDate = since ? since.toISOString().split("T")[0] : "";
    const untilDate = until ? until.toISOString().split("T")[0] : "";
    const metrics = `page_impressions,page_actions_post_reactions_total,page_fan_adds,page_post_engagements,page_fans,page_video_views,post_reactions_like_total`;
    const url = `/${pageId}/insights?metric=${metrics}&period=${period}&since=${sinceDate}&until=${untilDate}&access_token=${page?.access_token}`;

    window.FB.api(url, (response) => {
      setLoading(false);
      if (response?.error) {
        setError(response?.error?.error_user_msg || "Failed to fetch insights.");
        setInsights({});
      } else {
        const insightsData = response?.data?.reduce((acc, item) => {
          acc[item?.name] = item?.values?.[0]?.value;
          return acc;
        }, {});
        setInsights(insightsData);
      }
    });
  }, [pageId, pages, period, since, until]);

  const onLogout = useCallback(() => {
    window.FB.logout((response) => {
      setUser(null);
      setPages([]);
      setInsights({});
    });
  }, []);

  return (
    <Container>
      <div id="facebook-jssdk"></div>
      {!user ? (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login with Facebook
          </Button>
        </Box>
      ) : (
        <Box mt={5}>
          <Card>
            <CardContent>
              <Grid
                container
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item display="flex" alignItems="center">
                  <Avatar
                    src={user?.picture?.data?.url}
                    alt="Profile"
                    sx={{ width: 56, height: 56 }}
                  />
                  <Typography variant="h4" ml={2}>
                    Welcome, {user?.name}
                  </Typography>
                </Grid>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </Grid>

              <Box display="flex" justifyContent="space-between" mt={3}>
                <FormControl style={{ marginRight: "20px", width: "25%" }}>
                  <InputLabel>Select a Page</InputLabel>
                  <Select onChange={handlePageChange} value={pageId}>
                    <MenuItem value="">
                      <em>Select a Page</em>
                    </MenuItem>
                    {pages?.map((page) => (
                      <MenuItem key={page.id} value={page.id}>
                        {page.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl style={{ marginRight: "20px", width: "25%" }}>
                  <InputLabel>Select a Period</InputLabel>
                  <Select onChange={handlePeriodChange} value={period}>
                    {periodOptions?.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box display="flex" mr={3}>
                    <DatePicker
                      label="Since"
                      value={since}
                      onChange={(newValue) => setSince(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                  <Box display="flex">
                    <DatePicker
                      label="Until"
                      value={until}
                      onChange={(newValue) => setUntil(newValue)}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Box>
                </LocalizationProvider>
              </Box>
              <Button
                style={{ marginTop: "20px" }}
                onClick={fetchPageInsights}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Insights"}
              </Button>
              {error && <Typography color="error">{error}</Typography>}

              {Object.keys(insights || {}).length > 0 && (
                <Box mt={5}>
                  <Typography variant="h5">Page Insights</Typography>
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Followers</Typography>
                          <Typography>{insights?.page_fans || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Engagement</Typography>
                          <Typography>
                            {insights?.page_post_engagements || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Impressions</Typography>
                          <Typography>
                            {insights?.page_impressions || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Total Reactions</Typography>
                          <Typography>
                            {insights?.page_actions_post_reactions_total
                              ?.like || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">Page Video Views</Typography>
                          <Typography>
                            {insights?.page_video_views || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default Login;
