import * as reviewDAO from './dao.js';

export default function ReviewRoutes(app) {
    // CREATE
    const createReview = async (req, res) => {
        try{
        const review = await reviewDAO.createReview(req.body);
        res.json(review);
        }
        catch (error) {
            const status = error.name === 'ValidationError' ? 400 : 500;
            res.status(status).json({ message: 'Error updating review', error: error.message });
        }
    };
    app.post('/api/reviews', createReview);

    // READ / FIND
    const findAllReviews = async (req, res) => {
        const reviews = await reviewDAO.findAllReviews();
        res.json(reviews);
    };
    app.get('/api/reviews', findAllReviews);

    const findReviewById = async (req, res) => {
        const { id } = req.params;
        const review = await reviewDAO.findReviewById(id);
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        res.json(review);
    };
    app.get('/api/reviews/:id', findReviewById);

    // this function corresponds with the mega query-builder function in the dao
    // STATUS: NOT WORKING
    // the idea is it could be used to build a query string to filter reviews by various parameters
    // for example: /api/reviews/query?username=weirdo?flagged=true
    const findReviewsQuery = async (req, res) => {
        try {
            const { bookId, rating, username, flagged, startDate, endDate, sortByLikes, limit } = req.query;
            const filters = {
                bookId,
                rating: rating ? parseInt(rating) : undefined,
                username,
                flagged: flagged === 'true', // Convert to boolean
                startDate,
                endDate,
                sortByLikes: sortByLikes === 'true',
                limit: limit ? parseInt(limit) : undefined
            };
            const reviews = await reviewDAO.findReviews(filters);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    }
    app.get('/api/reviews/query', findReviewsQuery);

    const findReviewsForBook = async (req, res) => {
        try {
            const { bookId } = req.params;
            // Check for a valid bookId, considering it should not be an empty string
            if (!bookId.trim()) {  // This ensures the string is not just whitespace
                res.status(400).json({ message: 'Invalid or missing book ID' });
                return;
            }
            const reviews = await reviewDAO.findReviewsForBook(bookId); // Assuming findReviewsForBook takes a single bookId argument
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    };

    app.get('/api/reviews/book/:bookId', findReviewsForBook);


    const findReviewsByUser = async (req, res) => {
        try {
            const { username } = req.params;
            if (!username) {
                res.status(400).json({ message: 'User not found' });
                return;
            }
            const reviews = await reviewDAO.findReviewsByUser(username);
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    };
    app.get('/api/reviews/user/:username', findReviewsByUser);

    const findReviewsForBookByRating = async (req, res) => {
        try {
            const { bookId, rating } = req.params;
            if (!bookId) {
                res.status(400).json({ message: 'Book not found' });
                return;
            }
            const reviews = await reviewDAO.findReviewsForBookByRating(bookId, rating);
            res.json(reviews);
        }
        catch (error) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    };
    app.get('/api/reviews/book/:bookId/rating/:rating', findReviewsForBookByRating);

    // TODO: find reviews by Date Range
    // TODO: find reviews by most likes


    // UPDATE
    const updateReview = async (req, res) => {
        try {
            const { id } = req.params;
            const review = await reviewDAO.updateReview(id, req.body);
            if (!review) {
                res.status(404).json({ message: 'Review not found' });
                return;
            }
            res.json(review);
        } catch (error) {
            const status = error.name === 'ValidationError' ? 400 : 500;
            res.status(status).json({ message: 'Error updating review', error: error.message });
        }
    }
    app.put('/api/reviews/:id', updateReview);

    // DELETE
    const deleteReview = async (req, res) => {
        try {
            const { id } = req.params;
            const review = await reviewDAO.deleteReview(id);
            if (!review) {
                res.status(404).json({ message: 'Review not found' });
                return;
            }
            res.json(review);
        } catch (error) {
            res.status(500).json({ message: 'Error deleting review', error: error.message });
        }
    }
    app.delete('/api/reviews/:id', deleteReview);
}

