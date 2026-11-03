import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Box,
  Stack,
  Chip,
  Collapse,
  IconButton,
} from '@material-ui/core'
import { ExpandMore, ExpandLess } from '@material-ui/icons'
import toolAxios from 'src/_apis_/toolAxios'

// Dev news / updates shown on the dashboard. Content is served from the
// `updates` table via GET /api/updates — post a new update by inserting a row,
// no redeploy needed. `tag` matches a key in TAG_STYLES below (or is null).

// Version-proof chip styling (works on MUI v4 and v5 — no success/info colors).
const TAG_STYLES = {
  New: { bg: '#e8f5e9', color: '#2e7d32' },
  Improved: { bg: '#e3f2fd', color: '#1565c0' },
  Fixed: { bg: '#ede7f6', color: '#5e35b1' },
  'Coming soon': { bg: '#fff8e1', color: '#f57f17' },
}

// Collapsed by default; the user's choice is remembered across visits.
const OPEN_KEY = 'umbrelytics_news_open'
const readOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

// Parse a 'YYYY-MM-DD' date as local midnight so it doesn't shift a day in
// negative-UTC timezones.
const fmtDate = (d) => {
  if (!d) return ''
  const dt = new Date(`${d}T00:00:00`)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString()
}

export default function NewsUpdates() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(readOpen)

  const toggleOpen = () =>
    setOpen((v) => {
      const next = !v
      try {
        localStorage.setItem(OPEN_KEY, next ? '1' : '0')
      } catch {
        /* ignore storage errors */
      }
      return next
    })

  useEffect(() => {
    let active = true
    toolAxios
      .get('/api/updates')
      .then((r) => {
        if (active) setItems(r.data?.data || [])
      })
      .catch((e) => console.log('Failed to load updates', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <Box sx={{ mb: 4 }}>
      {/* Clickable header toggles the section open/closed */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        onClick={toggleOpen}
        sx={{
          mb: open ? 2 : 0,
          cursor: 'pointer',
          width: 'fit-content',
          userSelect: 'none',
        }}
      >
        <Typography variant="h5">What&apos;s New</Typography>
        {!loading && items.length > 0 && (
          <Chip
            label={items.length}
            size="small"
            sx={{
              height: 20,
              bgcolor: '#e8f5e9',
              color: '#2e7d32',
              fontWeight: 700,
            }}
          />
        )}
        <IconButton size="small" aria-label={open ? 'Collapse' : 'Expand'}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Stack>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Card variant="outlined">
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Loading updates…
              </Typography>
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No updates yet.
              </Typography>
            </Box>
          ) : (
            // Single compact, scrollable list — keeps the section short no
            // matter how many updates there are.
            <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
              {items.map((u, i) => {
                const s = TAG_STYLES[u.tag]
                return (
                  <Box
                    key={u.id}
                    sx={{
                      px: 2,
                      py: 1.25,
                      borderBottom: i < items.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ flexWrap: 'wrap' }}
                    >
                      {u.tag && (
                        <Chip
                          label={u.tag}
                          size="small"
                          sx={{
                            height: 20,
                            bgcolor: s ? s.bg : 'action.hover',
                            color: s ? s.color : 'text.primary',
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, minWidth: 0 }}
                        noWrap
                      >
                        {u.title}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
                      >
                        {fmtDate(u.date)}
                      </Typography>
                    </Stack>
                    {u.body && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mt: 0.25,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {u.body}
                      </Typography>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </Card>
      </Collapse>
    </Box>
  )
}
