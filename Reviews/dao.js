import reviewModel from "./model.js";

// CREATE
export const createReview = async (review) => {
    try {
        delete review._id
        return await reviewModel.create(review);
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new Error(`Invalid review data: ${error.message}`);
        } else {
            throw new Error('Failed to create review due to unexpected error');
        }
    }
};

// FIND/READ 

// find all reviews
export const findAllReviews = () => reviewModel.find(); // consider pagination for this one

// find a review by id
export const findReviewById = (id) => reviewModel.findById(id);

// NOTE: I feel like these next 3-4 could cleverly be combined into one function with optional parameters. Query strings?
// trying it out below
/**
 * Finds reviews based on various optional criteria. A mega query function :)
 * @param {Object} filters - An object containing any combination of filters.
 * @returns {Promise<Array>} - A promise that resolves to an array of reviews.
 */
export const findReviews = async (filters = {}) => {
    const query = {};

    // Filter by book ID
    if (filters.bookId) {
        query.bookId = filters.bookId;
    }

    // Filter by username
    if (filters.username) {
        query.username = filters.username;
    }

    // Filter by flagged status
    if (filters.flagged) {
        query.flagged = filters.flagged === 'true'; // expecting 'true' or 'false' as string if passed in query
    }

    // Filter by rating
    if (filters.rating) {
        query.rating = Number(filters.rating); // Ensure conversion from string to number
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
        query.datePosted = {
            $gte: new Date(filters.startDate),
            $lte: new Date(filters.endDate)
        };
    }

    // Build the query object with optional sorting and limiting for likes
    let queryBuilder = reviewModel.find(query);
    if (filters.sortByLikes) {
        queryBuilder = queryBuilder.sort({ likes: -1 });
    }
    if (filters.limit) {
        queryBuilder = queryBuilder.limit(Number(filters.limit));
    }

    return await queryBuilder.exec();
};

// NOTE: if the above works well, we can remove these below

// find all reviews for a specific book
export const findReviewsForBook = async (bookId) => {
    return await reviewModel.find({ bookId: bookId });
};

// find all reviews by a specific user
export const findReviewsByUser = async (username) => { // if we go this route, users can't change usernames
    return await reviewModel.find({ username: username });
};

// find flagged reviews
export const findFlaggedReviews = async () => {
    return await reviewModel.find({ flagged: true });
};

// find all reviews of a book filtered by rating
export const findReviewsForBookByRating = async (bookId, rating) => {
    return await reviewModel.find({
        bookId: bookId,
        rating: rating
    });
};

// find all reviews by date range? (stretch goal)
export const findReviewsByDateRange = async (startDate, endDate) => {
    return await reviewModel.find({
        datePosted: { $gte: startDate, $lte: endDate }
    });
};

// find reviews by most likes (stretch goal) -- meeds some work
export const findReviewsByMostLikes = async (limit = 10) => {
    return await reviewModel.find().sort({ likes: -1 }).limit(limit);
};

// UPDATE
export const updateReview = async (id, review) => {
    try {
        const updatedReview = await reviewModel.findByIdAndUpdate(id, { $set: review }, {
            new: true, // Return the modified document rather than the original.
            runValidators: true // Ensures that update operations adhere to the schema's validation rules.
        });
        if (!updatedReview) {
            throw new Error('Review not found');
        }
        return updatedReview;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new Error(`Invalid review data: ${error.message}`);
        } else {
            throw new Error('Failed to update review due to unexpected error: ' + error.message);
        }
    }
};

// DELETE
export const deleteReview = async (id) => {
    const deletedReview = await reviewModel.findByIdAndDelete(id);
    if (!deletedReview) {
        throw new Error('Review not found');
    }
    return deletedReview;
}
