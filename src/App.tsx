import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import {ThemeProvider} from '@mui/material/styles'
import {Container, CssBaseline, Typography} from '@mui/material'
import {theme} from './theme/theme'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Container maxWidth="lg" sx={{py: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Hello World! 🚀
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        React + TypeScript + Material UI + React Query foundation is ready for development.
                    </Typography>
                </Container>
                <ReactQueryDevtools initialIsOpen={false}/>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App