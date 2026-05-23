from sklearn.metrics.pairwise import cosine_similarity

def compare_embeddings(
    emb1,
    emb2
):

    similarity = cosine_similarity(
            emb1.cpu(),
            emb2.cpu()
        )

    return similarity[0][0]