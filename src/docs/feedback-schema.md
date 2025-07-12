
# Police Sacco Feedback System Documentation

## Overview
The Police Sacco Feedback System is a comprehensive, mobile-first feedback collection platform that provides randomized scoring and supports multiple question types.

## Features
- ✅ Mobile-first responsive design
- ✅ Smooth animations and transitions
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Police Sacco brand consistency
- ✅ Random lottery-style scoring (1-100 points per question)
- ✅ Multiple question types support
- ✅ Dynamic question management via backend CMS
- ✅ Progress tracking and validation

## Question Types Supported

### 1. Star Rating (`star`)
5-star rating system for satisfaction scores.

### 2. Net Promoter Score (`nps`)
0-10 scale for measuring customer loyalty and likelihood to recommend.

### 3. Likert Scale (`likert`)
Configurable agreement scale (typically 1-5) with custom labels.

### 4. Single Choice (`single-choice`)
Radio button selection from predefined options.

### 5. Multiple Choice (`multi-choice`)
Checkbox selection allowing multiple answers.

### 6. Open Text (`text`)
Free-form text input for detailed feedback.

## JSON Schema for Backend Question Configuration

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Feedback Questions Configuration",
  "type": "object",
  "properties": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier for the question"
          },
          "type": {
            "type": "string",
            "enum": ["star", "nps", "likert", "single-choice", "multi-choice", "text"],
            "description": "Type of question component to render"
          },
          "question": {
            "type": "string",
            "description": "The question text to display"
          },
          "required": {
            "type": "boolean",
            "description": "Whether the question must be answered"
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Available options for choice-type questions"
          },
          "scale": {
            "type": "object",
            "properties": {
              "min": {
                "type": "number",
                "description": "Minimum value for scale"
              },
              "max": {
                "type": "number", 
                "description": "Maximum value for scale"
              },
              "minLabel": {
                "type": "string",
                "description": "Label for minimum value"
              },
              "maxLabel": {
                "type": "string",
                "description": "Label for maximum value"
              }
            },
            "required": ["min", "max"],
            "description": "Scale configuration for likert questions"
          },
          "order": {
            "type": "number",
            "description": "Display order of the question"
          }
        },
        "required": ["id", "type", "question", "required"],
        "additionalProperties": false
      }
    }
  },
  "required": ["questions"]
}
```

## Example Question Configuration

```json
{
  "questions": [
    {
      "id": "satisfaction",
      "type": "star",
      "question": "How satisfied are you with our service?",
      "required": true,
      "order": 1
    },
    {
      "id": "nps",
      "type": "nps", 
      "question": "How likely are you to recommend Police Sacco to a friend?",
      "required": true,
      "order": 2
    },
    {
      "id": "ease-of-use",
      "type": "likert",
      "question": "Our services are easy to use",
      "required": true,
      "scale": {
        "min": 1,
        "max": 5,
        "minLabel": "Strongly Disagree",
        "maxLabel": "Strongly Agree"
      },
      "order": 3
    },
    {
      "id": "preferred-service",
      "type": "single-choice",
      "question": "Which service do you use most frequently?",
      "required": true,
      "options": [
        "Savings Account",
        "Loans", 
        "Insurance",
        "Investment",
        "Mobile Banking"
      ],
      "order": 4
    },
    {
      "id": "improvements",
      "type": "multi-choice",
      "question": "What areas would you like us to improve?",
      "required": false,
      "options": [
        "Customer Service",
        "Mobile App",
        "Interest Rates", 
        "Branch Hours",
        "Online Services"
      ],
      "order": 5
    },
    {
      "id": "comments",
      "type": "text",
      "question": "Please share any additional comments",
      "required": false,
      "order": 6
    }
  ]
}
```

## API Endpoints

### GET /api/feedback/questions
Retrieves the current question configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [...] // Array of question objects
  }
}
```

### POST /api/feedback/submit
Submits feedback responses.

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "satisfaction",
      "value": 5,
      "score": 87
    },
    {
      "questionId": "comments", 
      "value": "Great service!",
      "score": 92
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "uuid",
    "totalScore": 179,
    "averageScore": 89.5
  }
}
```

## Brand Guidelines

### Colors
- **Primary**: #073763 (Deep Blue)
- **Accent**: #007ACE (Bright Blue)
- **Success**: #22c55e (Green)
- **Warning**: #f59e0b (Yellow) 
- **Error**: #ef4444 (Red)

### Logo
- Source: https://policesacco.com/
- Position: Top-left of feedback form
- Fallback: "Police Sacco" text in primary color

### Typography
- Headlines: Bold, #073763
- Body text: Regular, #374151
- Accent text: Medium, #007ACE

## Accessibility Features

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ High contrast color ratios
- ✅ Focus indicators
- ✅ Semantic HTML structure

## Technical Implementation

### Components Structure
```
src/components/
├── FeedbackForm.tsx          # Main feedback form container
├── ThankYouModal.tsx         # Results and scoring display
└── feedback/
    ├── StarRating.tsx        # 5-star rating component
    ├── NPSRating.tsx         # Net Promoter Score component
    ├── LikertScale.tsx       # Agreement scale component
    ├── MultipleChoice.tsx    # Radio/checkbox selection
    └── OpenText.tsx          # Text input component
```

### State Management
- Form responses stored in local React state
- Progress tracking with validation
- Random score generation on submission
- Smooth transitions between questions

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interaction targets (44px minimum)
- Optimized for portrait and landscape orientations
