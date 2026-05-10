<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function fetchBlogs(Request $request)
    {
        $blogs = Blog::get();

        return response()->json($blogs);
    }

    public function createBlog(Request $request)
    {
        $user_id = $request->user()->id;

        $request->validate([
            'title' => ['required'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png'],
            'description' => ['required'],
        ]);

        $image_url = $request->file('image')->store('blogs', 'public');

        Blog::create([
            'user_id' => $user_id,
            'title' => $request->title,
            'image' => $image_url,
            'description' => $request->description
        ]);

        return response()->json([
            'message' => 'Blog created successfully!'
        ], 200);
    }

    public function show($id)
{
    $blog = Blog::find($id);
    
    if (!$blog) {
        return response()->json(['message' => 'Blog not found'], 404);
    }
    
    return response()->json($blog);
}

                public function destroy($id)
{
    try {
        $blog = Blog::find($id);

        if (!$blog) {
            return response()->json([
                'message' => 'Blog not found'
            ], 404);
        }

        // Debug
        \Log::info('Authenticated user ID: ' . auth()->id());
        \Log::info('Blog owner ID: ' . $blog->user_id);

        // Optional ownership check
        if ($blog->user_id != auth()->id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $blog->delete();

        return response()->json([
            'message' => 'Blog deleted successfully'
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage()
        ], 500);
    }
}
}
