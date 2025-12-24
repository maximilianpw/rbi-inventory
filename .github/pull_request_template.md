## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes, no API changes)
- [ ] Documentation update
- [ ] Configuration/infrastructure change

## Related Issues

<!-- Link to related issues using #issue_number -->

Closes #

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## Checklist

<!-- Mark completed items with an 'x' -->

### General
- [ ] My code follows the project's code style
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### API Changes (if applicable)
- [ ] I have regenerated the OpenAPI spec (`pnpm --filter @rbi/api openapi:generate`)
- [ ] I have regenerated the frontend client (`pnpm --filter @rbi/web api:gen`)
- [ ] I have committed both `openapi.yaml` and `modules/web/src/lib/data/generated.ts`
- [ ] API changes are backward compatible OR breaking changes are documented

### Database Changes (if applicable)
- [ ] I have created/updated database migrations
- [ ] Migration rollback has been tested
- [ ] I have updated the entity documentation

### Testing
- [ ] I have added/updated unit tests
- [ ] I have added/updated integration tests
- [ ] All tests pass locally (`pnpm test`)
- [ ] I have tested the changes in a local environment

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

## Deployment Notes

<!-- Any special instructions for deployment -->
